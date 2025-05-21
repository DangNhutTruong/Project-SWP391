import { FaFacebookF, FaLinkedinIn, FaTwitter, FaYoutube, FaInstagram } from "react-icons/fa";
import { IoChevronUpOutline } from "react-icons/io5";
import './footer.css';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer>
      <button className="back-to-top" onClick={scrollToTop}>
        Back to top of page <IoChevronUpOutline />
      </button>
      <div className="container">
        <div className="footer-top">
          <div className="footer-col">
            <h4>Looking for</h4>
            <ul>
              <li><a href="#">Quitting resources</a></li>
              <li><a href="#">In-language resources</a></li>
              <li><a href="#">Quitline referral</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>About Quit</h4>
            <ul>
              <li><a href="#">Our story</a></li>
              <li><a href="#">Newsroom</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact Quit</h4>
            <ul>
              <li><a href="#">Contact us</a></li>
              <li><a href="#">Media</a></li>
            </ul>
          </div>
          <div className="footer-col quitline">
            <img src="/image/quitline-logo.png" alt="Quitline 13 7848" />
            <div className="social-icons">
              <a href="#" aria-label="Facebook"><FaFacebookF /></a>
              <a href="#" aria-label="LinkedIn"><FaLinkedinIn /></a>
              <a href="#" aria-label="Twitter"><FaTwitter /></a>
              <a href="#" aria-label="YouTube"><FaYoutube /></a>
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
            </div>
          </div>
        </div>

        <div className="footer-middle">
          <p>Quit acknowledges the traditional custodians of the lands on which we live and work. We pay our respects to Elders past, present, and emerging and extend that respect to all Aboriginal and Torres Strait Islander peoples.</p>
          <div className="aboriginal-flags">
            <img src="/image/aboriginal-flag.png" alt="Aboriginal Flag" />
            <img src="/image/torres-strait-island-flag.png" alt="Torres Strait Island Flag" />
            <img src="/image/aboriginal-torres-strait-island-flag.png" alt="Aboriginal and Torres Strait Island Flag" />
          </div>
        </div>

        <div className="footer-sponsors">
          <p>Proud Supporters</p>
          <div className="sponsor-logos">
            <img src="https://www.quit.org.au/images/default-source/default-album/australian-government.png" alt="Australian Government" />
            <img src="https://www.quit.org.au/images/default-source/default-album/cancer-council-victoria-logo-retina.png" alt="Cancer Council Victoria" />
            <img src="https://www.quit.org.au/images/default-source/default-album/vic-health-logo-retina.png" alt="VicHealth" />
            <img src="https://www.quit.org.au/images/default-source/default-album/heart-foundation-logo-retina.png" alt="Heart Foundation" />
          </div>
        </div>

        <div className="footer-bottom">
          <p>Quit © 2023</p>
          <div className="footer-bottom-links">
            <a href="#">Copyright</a>
            <a href="#">Privacy</a>
            <a href="#">Accessibility</a>
            <a href="#">Disclaimer</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
