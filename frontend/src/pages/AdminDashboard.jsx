import { Link } from "react-router-dom";

function AdminDashboard() {
    return (
        <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome, Admin!</p>

            <ul>
                <li><Link to="/admin-issues">Manage All Issues</Link></li>
                {/* Later you can add more admin features */}
            </ul>
        </div>
    );
}

export default AdminDashboard;
