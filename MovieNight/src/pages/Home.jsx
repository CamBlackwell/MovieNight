import "./Home.css";

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">The chosen one for this week is...</h1>
      <div className="name-box">
        <h1 className="selected-name"> BILL </h1>
      </div>

      <div className="add-member-button">
        <h1 className="add-member-text"> + ADD MEMBER </h1>
      </div>

      <div className="view-members-button">
        <h1 className="view-members-text"> VIEW MEMBERS </h1>
      </div>

      <div className="set-calendar-button">
        <h1 className="view-calendar-text"> VIEW CALENDAR </h1>
      </div>

    </div>
  );
}