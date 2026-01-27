import { useState, useEffect } from "react";
import "./Home.css";
import { supabase } from "../supabaseClient";

export default function Home() {
  const [members, setMembers] = useState([]);
  const [settings, setSettings] = useState(null);
  const [currentPicker, setCurrentPicker] = useState(null);
  const [nextPicker, setNextPicker] = useState(null);
  const [calendarEntries, setCalendarEntries] = useState([]);

  const [newMemberName, setNewMemberName] = useState("");
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editingMemberName, setEditingMemberName] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showReorder, setShowReorder] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (members.length > 0 && settings) {
      computeRotation();
      computeCalendar();
    } else {
      setCurrentPicker(null);
      setNextPicker(null);
      setCalendarEntries([]);
    }
  }, [members, settings]);

  async function loadInitialData() {
    const { data: memberData, error: memberError } = await supabase
      .from("members")
      .select("*")
      .order("position", { ascending: true });

    if (memberError) {
      console.error("Load members error:", memberError);
    } else {
      setMembers(memberData || []);
    }

    const { data: settingsData, error: settingsError } = await supabase
      .from("rotation_settings")
      .select("*")
      .single();

    if (settingsError) {
      console.error("Load settings error:", settingsError);
    } else {
      setSettings(settingsData);
    }
  }

  function computeRotation() {
    if (!settings || members.length === 0) return;
    const start = new Date(settings.start_date);
    const today = new Date();
    const msDiff = today.getTime() - start.getTime();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const weeksPassed = Math.floor(msDiff / weekMs);
    const currentIndex = ((weeksPassed % members.length) + members.length) % members.length;
    const nextIndex = (currentIndex + 1) % members.length;
    setCurrentPicker(members[currentIndex]);
    setNextPicker(members[nextIndex]);
  }

  function computeCalendar() {
    if (!settings || members.length === 0) {
      setCalendarEntries([]);
      return;
    }
    const start = new Date(settings.start_date);
    const today = new Date();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const msDiff = today.getTime() - start.getTime();
    const weeksPassed = Math.floor(msDiff / weekMs);
    const entries = [];
    const count = 10;
    for (let i = 0; i < count; i++) {
      const weekOffset = weeksPassed + i;
      const weekStart = new Date(start.getTime() + weekOffset * weekMs);
      const index = ((weekOffset % members.length) + members.length) % members.length;
      const member = members[index];
      entries.push({
        id: `${weekOffset}-${member.id}`,
        weekStart,
        memberName: member.name,
      });
    }
    setCalendarEntries(entries);
  }

  async function handleAddMember() {
    const trimmed = newMemberName.trim();
    if (!trimmed) return;
    const maxPos = members.reduce((max, m) => Math.max(max, m.position || 0), 0);
    const newPosition = maxPos + 1;
    const { data, error } = await supabase
      .from("members")
      .insert({ name: trimmed, position: newPosition })
      .select();
    if (error) {
      console.error("Add member error:", error);
      return;
    }
    const inserted = data[0];
    setMembers(prev =>
      [...prev, inserted].sort((a, b) => (a.position || 0) - (b.position || 0))
    );
    setNewMemberName("");
  }

  async function handleDeleteMember(id) {
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (error) {
      console.error("Delete member error:", error);
      return;
    }
    setMembers(prev => prev.filter(m => m.id !== id));
  }

  function startEditing(member) {
    setEditingMemberId(member.id);
    setEditingMemberName(member.name);
  }

  function cancelEditing() {
    setEditingMemberId(null);
    setEditingMemberName("");
  }

  async function saveEditingMember(id) {
    const trimmed = editingMemberName.trim();
    if (!trimmed) return;
    const { data, error } = await supabase
      .from("members")
      .update({ name: trimmed })
      .eq("id", id)
      .select();
    if (error) {
      console.error("Update member error:", error);
      return;
    }
    const updated = data[0];
    setMembers(prev =>
      prev
        .map(m => (m.id === id ? updated : m))
        .sort((a, b) => (a.position || 0) - (b.position || 0))
    );
    setEditingMemberId(null);
    setEditingMemberName("");
  }

  async function moveMember(memberId, direction) {
    const current = members.find(m => m.id === memberId);
    if (!current) return;
    const sorted = [...members].sort((a, b) => (a.position || 0) - (b.position || 0));
    const index = sorted.findIndex(m => m.id === memberId);
    if (index === -1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;
    const other = sorted[targetIndex];
    const currentPos = current.position || 0;
    const otherPos = other.position || 0;
    const { error: err1 } = await supabase
      .from("members")
      .update({ position: otherPos })
      .eq("id", current.id);
    const { error: err2 } = await supabase
      .from("members")
      .update({ position: currentPos })
      .eq("id", other.id);
    if (err1 || err2) {
      console.error("Reorder error:", err1 || err2);
      return;
    }
    const newMembers = members.map(m => {
      if (m.id === current.id) return { ...m, position: otherPos };
      if (m.id === other.id) return { ...m, position: currentPos };
      return m;
    });
    setMembers(newMembers.sort((a, b) => (a.position || 0) - (b.position || 0)));
  }

  function formatDate(date) {
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="settings-container">
      <h1 className="settings-text">Settings</h1>

      <div className="section-buttons">
        <button
          className={`section-toggle-button ${showAdd ? "open" : ""}`}
          onClick={() => setShowAdd(prev => !prev)}
        >
          Add Member
        </button>
        <button
          className={`section-toggle-button ${showMembers ? "open" : ""}`}
          onClick={() => setShowMembers(prev => !prev)}
        >
          View / Edit Members
        </button>
        <button
          className={`section-toggle-button ${showReorder ? "open" : ""}`}
          onClick={() => setShowReorder(prev => !prev)}
        >
          Reorder Members
        </button>
        <button
          className={`section-toggle-button ${showCalendar ? "open" : ""}`}
          onClick={() => setShowCalendar(prev => !prev)}
        >
          Upcoming Calendar
        </button>
      </div>

      {showAdd && (
        <div className="section-panel">
          <h2 className="section-title">Add Member</h2>
          <div className="add-member-row">
            <input
              className="member-input"
              placeholder="Member name"
              value={newMemberName}
              onChange={e => setNewMemberName(e.target.value)}
            />
            <button className="member-action-button" onClick={handleAddMember}>
              Add
            </button>
          </div>
        </div>
      )}

      {showMembers && (
        <div className="section-panel">
          <h2 className="section-title">Members</h2>
          {members.length === 0 && <p>No members yet.</p>}
          {members.map(member => (
            <div key={member.id} className="member-row">
              {editingMemberId === member.id ? (
                <>
                  <input
                    className="member-input"
                    value={editingMemberName}
                    onChange={e => setEditingMemberName(e.target.value)}
                  />
                  <button
                    className="member-action-button"
                    onClick={() => saveEditingMember(member.id)}
                  >
                    Save
                  </button>
                  <button
                    className="member-delete-button"
                    onClick={cancelEditing}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span className="member-name">
                    {member.position}. {member.name}
                  </span>
                  <div className="member-actions">
                    <button
                      className="member-action-button"
                      onClick={() => startEditing(member)}
                    >
                      Edit
                    </button>
                    <button
                      className="member-delete-button"
                      onClick={() => handleDeleteMember(member.id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {showReorder && (
        <div className="section-panel">
          <h2 className="section-title">Reorder Members</h2>
          {members.length === 0 && <p>No members yet.</p>}
          {members
            .slice()
            .sort((a, b) => (a.position || 0) - (b.position || 0))
            .map((member, index, arr) => (
              <div key={member.id} className="member-row">
                <span className="member-name">
                  {member.position}. {member.name}
                </span>
                <div className="member-actions">
                  <button
                    className="member-action-button"
                    disabled={index === 0}
                    onClick={() => moveMember(member.id, "up")}
                  >
                    Up
                  </button>
                  <button
                    className="member-action-button"
                    disabled={index === arr.length - 1}
                    onClick={() => moveMember(member.id, "down")}
                  >
                    Down
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {showCalendar && (
        <div className="section-panel">
          <h2 className="section-title">Upcoming Picks</h2>
          {calendarEntries.length === 0 && <p>No upcoming entries.</p>}
          {calendarEntries.map(entry => (
            <div key={entry.id} className="calendar-row">
              <span className="calendar-date">{formatDate(entry.weekStart)}</span>
              <span className="calendar-name">{entry.memberName}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
