import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <p>
        GrepHub lets you search GitHub the way you're used to searching code.
      </p>
      <p>
        Try searching <Link to="/hmarr/dotfiles">@hmarr's dotfiles</Link>.
      </p>
    </div>
  );
}
export default Home;
