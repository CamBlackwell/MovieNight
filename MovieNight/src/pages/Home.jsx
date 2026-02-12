import { useState, useEffect } from "react";
import "./Home.css";
import { supabase } from "../supabaseClient";

export default function Home() {
  const [members, setMembers] = useState([]);
  const [settings, setSettings] = useState(null);
  const [currentPicker, setCurrentPicker] = useState(null);
  const [nextPicker, setNextPicker] = useState(null);

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
    }    setCalendarEntries(entries);
  }

  return (
    <div className="home-container">
      <h1 className="intro-text">The chosen one for this week is...</h1>
      <div className="name-box">
        <h1 className="selected-name">
          {currentPicker ? currentPicker.name : "No members yet"}
        </h1>
      </div>

      <div className="next-box">
        <span className="next-label">Next week:</span>{" "}
        <span className="next-name">
          {nextPicker ? nextPicker.name : "No next picker"}
        </span>
      </div>

    </div>
  );
}
