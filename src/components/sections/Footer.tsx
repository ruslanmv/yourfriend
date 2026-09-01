import { Link } from 'react-router-dom';
export function Footer() {
  return <footer className="footer"><div className="container footer__inner"><a className="brand" href="#top"><span className="brand__mark"/><strong>YourFriend</strong></a><nav><a href="#product">Product</a><a href="#experiences">Experiences</a><a href="#privacy">Privacy</a><Link to="/privacy-policy">Privacy policy</Link><Link to="/terms">Terms</Link></nav><p>© {new Date().getFullYear()} YourFriend. All rights reserved.</p></div></footer>;
}
