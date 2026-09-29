import { NavLink } from "react-router-dom";

function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h2>Mahasiswa Hub</h2>
            </div>

            <nav className="sidebar-menu">
                <NavLink to="/dashboard">
                    Dashboard
                </NavLink>

                <NavLink to="/confession">
                    Confession
                </NavLink>

                <NavLink to="/materials">
                    Materials
                </NavLink>

                <NavLink to="/question-banks">
                    Question Banks
                </NavLink>

                <NavLink to="/internship">
                    Internship
                </NavLink>

                <NavLink to="/friends">
                    Friends
                </NavLink>

                <NavLink to="/profile">
                    Profile
                </NavLink>
            </nav>
        </aside>
    );
}

export default Sidebar;