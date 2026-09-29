import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "./AppLayout.css";

function MainLayout({ user }) {
    return (
        <div className="app-layout">
            <Sidebar />

            <div className="main-area">
                <Header user={user} />

                <main className="content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default MainLayout;