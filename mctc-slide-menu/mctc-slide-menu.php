<?php
/**
 * Plugin Name: MCTC Slide Menu
 * Description: Accessible right-side navigation with separate desktop and mobile WordPress menus. Shortcode: [mctc_menu desktop="desktop-menu" mobile="mobile-menu"]
 * Version: 1.0.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * License: GPL-2.0-or-later
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

// Load on the front end so shortcodes in headers and page builders work, too.
// Version by file modification time so browsers and caches pick up edits immediately.
add_action( 'wp_enqueue_scripts', function () {
    $css = 'assets/menu.css';
    $js = 'assets/menu.js';
    wp_enqueue_style( 'mctc-slide-menu', plugins_url( $css, __FILE__ ), array(), (string) filemtime( plugin_dir_path( __FILE__ ) . $css ) );
    wp_enqueue_script( 'mctc-slide-menu', plugins_url( $js, __FILE__ ), array(), (string) filemtime( plugin_dir_path( __FILE__ ) . $js ), true );
} );

add_filter( 'nav_menu_item_id', function ( $id, $item, $args ) {
    return isset( $args->mctc_instance ) ? $args->mctc_instance . '-item-' . $item->ID : $id;
}, 10, 3 );

// Styling hooks on menu items, links and submenus, only for menus this plugin renders.
add_filter( 'nav_menu_css_class', function ( $classes, $item, $args, $depth ) {
    if ( isset( $args->mctc_instance ) ) {
        array_push( $classes, 'mctc-item', 'mctc-depth-' . (int) $depth );
        if ( 0 === (int) $depth ) { $classes[] = 'mctc-item--top'; }
    }
    return $classes;
}, 10, 4 );

add_filter( 'nav_menu_link_attributes', function ( $atts, $item, $args, $depth ) {
    if ( isset( $args->mctc_instance ) ) {
        $class = 0 === (int) $depth ? 'mctc-link mctc-link--top' : 'mctc-link';
        $atts['class'] = trim( ( isset( $atts['class'] ) ? $atts['class'] . ' ' : '' ) . $class );
    }
    return $atts;
}, 10, 4 );

add_filter( 'nav_menu_submenu_css_class', function ( $classes, $args ) {
    if ( isset( $args->mctc_instance ) ) { $classes[] = 'mctc-submenu'; }
    return $classes;
}, 10, 2 );

add_shortcode( 'mctc_menu', function ( $atts ) {
    $atts = shortcode_atts( array(
        'desktop' => '', 'mobile' => '', 'main' => 'Desktop Main Nav',
        'label' => 'Open navigation menu', 'layout' => 'columns', 'class' => '',
    ), $atts, 'mctc_menu' );
    // Optional custom classes, added to both the hamburger wrapper and the drawer.
    $extra = implode( ' ', array_filter( array_map( 'sanitize_html_class', preg_split( '/\s+/', $atts['class'] ) ) ) );
    $extra = $extra !== '' ? ' ' . $extra : '';
    $is_admin = current_user_can( 'edit_theme_options' );
    $desktop = wp_get_nav_menu_object( $atts['desktop'] );
    $mobile = $atts['mobile'] !== '' ? wp_get_nav_menu_object( $atts['mobile'] ) : null;
    if ( ! $desktop || ( $atts['mobile'] !== '' && ! $mobile ) ) {
        return $is_admin
            ? '<p class="mctc-menu-error">MCTC Menu: Please select existing WordPress menus in the desktop and mobile shortcode attributes.</p>' : '';
    }
    // Without mobile="", the mobile drawer shows the main header menu followed by the desktop flyout menu.
    $notice = '';
    if ( $mobile ) {
        $mobile_menus = array( $mobile );
    } else {
        $main = wp_get_nav_menu_object( $atts['main'] );
        $mobile_menus = $main ? array( $main, $desktop ) : array( $desktop );
        if ( ! $main && $is_admin ) {
            $notice = '<p class="mctc-menu-error">MCTC Menu: No menu named "' . esc_html( $atts['main'] ) . '" was found, so mobile shows only the desktop menu.</p>';
        }
    }
    $uid = wp_unique_id( 'mctc-menu-' );
    // Render only the <li> items of each menu so several menus can share one list.
    $items = function ( $menu, $mode ) use ( $uid ) {
        return (string) wp_nav_menu( array(
            'menu' => $menu, 'container' => false, 'echo' => false, 'fallback_cb' => false,
            'depth' => 0, 'items_wrap' => '%3$s', 'mctc_instance' => $uid . '-' . $mode,
        ) );
    };
    $menus = array();
    foreach ( array( 'desktop' => array( $desktop ), 'mobile' => $mobile_menus ) as $mode => $list ) {
        $html = '';
        foreach ( $list as $menu ) { $html .= $items( $menu, $mode ); }
        $menus[ $mode ] = '<ul id="' . esc_attr( $uid . '-' . $mode . '-list' ) . '" class="mctc-tree">' . $html . '</ul>';
    }
    ob_start();
    echo $notice; // Escaped above; shown to admins only.
    ?>
    <span class="mctc-widget<?php echo esc_attr( $extra ); ?>">
        <button type="button" class="mctc-trigger" aria-label="<?php echo esc_attr( $atts['label'] ); ?>" aria-haspopup="dialog" aria-controls="<?php echo esc_attr( $uid ); ?>" aria-expanded="false" hidden>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true"><path d="M3 5h20M3 13h20M3 21h20" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>
        </button>
        <dialog id="<?php echo esc_attr( $uid ); ?>" class="mctc-dialog<?php echo esc_attr( $extra ); ?>" aria-label="Site menu" data-layout="<?php echo $atts['layout'] === 'accordion' ? 'accordion' : 'columns'; ?>">
            <div class="mctc-panel">
                <div class="mctc-panel-top">
                    <button type="button" class="mctc-close" aria-label="Close navigation menu" autofocus><svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
                </div>
                <div class="mctc-scroll">
                    <nav class="mctc-desktop" aria-label="Site pages"><?php echo $menus['desktop']; // WordPress-generated menu markup. ?></nav>
                    <nav class="mctc-mobile" aria-label="Site pages"><?php echo $menus['mobile']; ?></nav>
                </div>
            </div>
        </dialog>
        <noscript><nav class="mctc-noscript" aria-label="Site pages"><?php echo $menus['mobile']; ?></nav></noscript>
    </span>
    <?php
    return ob_get_clean();
} );
