import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="section">
      <div className="wrap">
        <h1>This page doesn&rsquo;t exist</h1>
        <p>The link may be old or mistyped. Everything we offer is on the home page.</p>
        <Link className="btn btn-primary" href="/">
          Go to the home page
        </Link>
      </div>
    </main>
  );
}
