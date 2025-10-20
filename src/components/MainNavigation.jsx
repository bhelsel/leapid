import { NavLink } from "react-router-dom";

import classes from "./MainNavigation.module.css";

function MainNavigation() {
  return (
    <header className={classes.header}>
      <nav>
        <ul className={classes.list}>
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? classes.active : undefined
              }
              end
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="stoplight"
              className={({ isActive }) =>
                isActive ? classes.active : undefined
              }
            >
              Stop Light Spinner
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className={classes.logoRight}>
        <img src="leap-logo.png" alt="Logo" />
      </div>
    </header>
  );
}

export default MainNavigation;
