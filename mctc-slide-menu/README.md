# MCTC slide-in WordPress menu

## Install
1. Zip the `mctc-slide-menu` folder (the one containing `mctc-slide-menu.php`).
2. In WordPress, go to **Plugins → Add New Plugin → Upload Plugin**, upload the zip, install, and activate.
3. Set up your menus under **Appearance → Menus**. Indent items under their parent to create submenus.
4. In **Divi → Theme Builder**, edit your global header. Add a **Text module**, switch its editor to Text mode, and paste the shortcode below. Keep this module visible on desktop, tablet, and phone. If the Text module adds stray `<p>` or `<br>` tags around the button, use a **Code module** instead.

```text
[mctc_menu desktop="Desktop Hamburger Nav"]
```

The desktop menu holds the extra links for the flyout. On mobile, the drawer automatically shows your header's main menu (`Desktop Main Nav`: About, Students, Academics, Jump Start, Apply Now…) followed by the desktop flyout menu, so you only maintain each menu once. To use a completely separate mobile menu instead, add `mobile="Your Mobile Menu"`.

This plugin only adds the hamburger and drawer: in your existing Divi Menu module, go to **Advanced → Visibility** and disable it on Phone and Tablet. Keep the new hamburger module enabled on all devices.

These are classic WordPress menus. If Appearance → Menus is missing, open `/wp-admin/nav-menus.php` on your site.

## Options
Menu names, slugs, and numeric IDs are accepted. Numeric IDs are the least ambiguous, and they keep working if you rename a menu.

| Attribute | Default | Purpose |
|---|---|---|
| `desktop` | (required) | Menu shown above 980px |
| `mobile` | (none) | A separate menu shown at 980px and below. When set, it's used on its own and `main` is ignored |
| `main` | `Desktop Main Nav` | Without `mobile`, mobile shows this menu first, then the `desktop` menu. If it doesn't exist, mobile shows just the desktop menu (admins see a notice) |
| `layout` | `columns` | Desktop layout: `columns` or `accordion` |
| `label` | `Open navigation menu` | Hamburger's screen-reader label |
| `class` | (none) | Your own class(es), added to both the hamburger wrapper and the drawer |

```text
[mctc_menu desktop="Desktop Hamburger Nav"]                                   ← mobile = Desktop Main Nav + Desktop Hamburger Nav
[mctc_menu desktop="Desktop Hamburger Nav" mobile="Desktop Mobile Nav"]      ← mobile = Desktop Mobile Nav only
[mctc_menu desktop="Desktop Hamburger Nav" main="Header Links"]              ← mobile = Header Links + Desktop Hamburger Nav
[mctc_menu desktop="42" layout="columns" class="header-menu"]
```

A page that's in both combined menus appears twice on mobile, so keep each link in just one of them.

## Customizing styles
Put your CSS in **Divi → Theme Options → Custom CSS** or your child theme's `style.css`. Everything the plugin styles uses `.mctc-` classes, so your changes can't spill into the rest of the site as long as your selectors start with `.mctc-` too.

> The drawer is moved to the end of the page when it loads, so it is **not** inside your Divi header or module. Style it with `.mctc-dialog` (or `.mctc-dialog.your-class`), never `.et_pb_text .mctc-dialog` or similar.

### 1. Variables (easiest, no specificity worries)
Set these on `.mctc-dialog` / `.mctc-trigger`, on your own `class`, or on `:root`. Anything you don't set falls back to the MCTC palette.

```css
.mctc-dialog {
  --mctc-menu-width: 900px;          /* desktop drawer width */
  --mctc-menu-heading: #004167;      /* main-page link color */
}
```

| Variable | Default | Controls |
|---|---|---|
| `--mctc-menu-trigger-bg` / `-trigger-color` | navy / white | Hamburger button |
| `--mctc-menu-trigger-hover-bg` / `-trigger-hover-color` | blue / white | Hamburger hover |
| `--mctc-menu-width` | `min(840px, 88vw)` | Drawer width on desktop |
| `--mctc-menu-width-mobile` | `min(460px, 86vw)` | Drawer width at 980px and below |
| `--mctc-menu-bg` | white | Drawer background |
| `--mctc-menu-accent` / `-accent-size` | blue / `7px` | Bar across the top of the drawer (`0` hides it) |
| `--mctc-menu-backdrop` | dark navy at 60% | Overlay behind the drawer |
| `--mctc-menu-speed` | `260ms` | Slide speed |
| `--mctc-menu-font` | inherited | Font family |
| `--mctc-menu-heading` / `-heading-size` / `-heading-weight` | blue / `18px` / `750` | Main-page links |
| `--mctc-menu-link` / `-link-size` / `-link-weight` | navy / `16px` / `450` | Sub-page links (and the X icon) |
| `--mctc-menu-hover` | forest | Link hover color |
| `--mctc-menu-current` | forest | Link to the page you're on |
| `--mctc-menu-divider` | `#dbe7ef` | Divider lines and sub-page rule |
| `--mctc-menu-button-bg` | mist | X and arrow button background |
| `--mctc-menu-button-hover-bg` / `-button-hover-color` | navy / white | X and arrow hover |
| `--mctc-menu-focus` | blue | Keyboard focus outline |
| `--mctc-menu-columns` / `-column-min` | `3` / `200px` | Desktop columns layout |

### 2. Classes
| Class | Element |
|---|---|
| `.mctc-trigger` | Hamburger button (`[aria-expanded="true"]` while open) |
| `.mctc-dialog` | The whole drawer, including the overlay (`.is-open` while open) |
| `.mctc-panel` | The white sliding panel |
| `.mctc-panel-top` / `.mctc-close` | Row holding the X / the X button |
| `.mctc-scroll` | Scrolling area holding the links |
| `.mctc-desktop` / `.mctc-mobile` | The desktop and mobile menus |
| `.mctc-item` / `.mctc-item--top` | Every menu item / main-page items only |
| `.mctc-depth-0`, `.mctc-depth-1`, … | Menu items by nesting level |
| `.mctc-link` / `.mctc-link--top` | Every link / main-page links only |
| `.mctc-link[aria-current="page"]` | Link to the current page |
| `.mctc-submenu` | A list of sub pages |
| `.mctc-row` / `.mctc-expand` | A link plus its arrow button / the arrow button |

WordPress's own classes are kept too, including `menu-item-123` and any **CSS Classes** you add to an item in Appearance → Menus (turn that field on under Screen Options).

### 3. Winning over the plugin's rules
The plugin's rules are at most three classes deep. If your rule doesn't take effect, start it with `body`:

```css
body .mctc-dialog .mctc-link--top { text-transform: uppercase; letter-spacing: .04em; }
body .mctc-dialog.header-menu .mctc-link:hover { text-decoration: none; }
```

## Behavior and design
- **Desktop (`columns`)**: a right-hand drawer up to 840px wide showing the whole menu as a sitemap. Each main page is a blue heading with its sub pages listed beneath, flowing into up to three columns. Nothing needs to be clicked open.
- **Desktop (`accordion`)**: a single column of collapsible sections, like mobile.
- **Mobile**: one column of collapsible sections in a drawer up to 460px wide; the area to the left can be tapped to close. Mobile is 980px and below.
- The drawer has no title or footer bar, just the X in the top-right corner above the links.
- Collapsible sections start closed, except for the current page's ancestors. Every parent item should be a real page: clicking its name goes to that page, and the arrow button beside it expands its sub pages.
- Close with the X, outside click/tap, or Escape. The page behind is locked while the drawer is open and is always unlocked however the drawer closes. Keyboard focus stays inside the drawer and returns to the hamburger afterward.
- Your CSS color variables are used with fallback values. Typography inherits from your theme. No external fonts, libraries, or network requests.
- Reduced-motion preferences are respected. With JavaScript disabled, the mobile menu appears as a plain list on mobile only.
- Supports multiple shortcode instances. Uses WordPress's standard menu renderer, so current-page markers and link targets are preserved.
- CSS and JS are versioned by file modification time, so edits show up without clearing browser caches. Caching/optimization plugins may still need their cache cleared.

## Testing
This package hasn't been run inside WordPress yet. Check on a staging site with your theme, caching/optimization plugins, and real menu content, in particular that Divi's sticky header doesn't jump when the drawer opens and closes. It requires a modern browser with native `<dialog>` support.

If you change the 980px breakpoint, change it in **both** `assets/menu.css` and `assets/menu.js` and align your header's own visibility settings.

Implementation references: [WordPress shortcodes](https://developer.wordpress.org/reference/functions/add_shortcode/) and [WordPress menu rendering](https://developer.wordpress.org/reference/functions/wp_nav_menu/).

## Divi and child themes
No child-theme edits are necessary; keeping this as a plugin means it survives theme changes. The drawer is moved to the end of the page to avoid header clipping and uses native dialog layering. Test on the published front end after leaving the Visual Builder. If you use custom Divi 5 breakpoints, align this plugin's breakpoint with your header settings. The default 980px boundary matches [Divi's standard desktop/tablet visibility](https://help.elegantthemes.com/en/articles/8671664-using-divi-visibility-options).
