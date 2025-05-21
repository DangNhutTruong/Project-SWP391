export default function Header() {
  return (
    <header>
      <div className="container">
        <div className="logo">
          <img src="https://logo.clearbit.com/quit.org.au" alt="Quit Logo" />
        </div>
        <div className="nav-actions">
          <a href="tel:137848" className="phone-link">CALL QUITLINE 13 7848</a>
          <button className="search-btn"><i className="fas fa-search"></i></button>
          <button className="info-btn"><i className="fas fa-info-circle"></i></button>
        </div>
      </div>
    </header>
  );
}
