import { Link } from 'react-router-dom';

export default function Nav() {
  return (
    <nav>
      <div className="container">
        <ul className="main-menu">
          <li className="active"><Link to="/">Home</Link></li>
          <li><Link to="/reasons">I'm here because...</Link></li>
          <li><Link to="/support">Get Support</Link></li>
          <li><Link to="/tools">Tools</Link></li>
          <li><Link to="/resources">Resources</Link></li>
          <li><Link to="/health-professionals">For Health Professionals</Link></li>
          <li><Link to="/communities">For Communities & Places</Link></li>
        </ul>
      </div>
    </nav>
  );
}
