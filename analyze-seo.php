<?php
/**
 * Plugin Name: Analyze SEO
 * Plugin URI: https://github.com/HelaGone/Anlayze_SEO_react_plugin
 * Description: This plugin analyzes SEO in a post
 * Author: Holkan Luna
 * Author URI: http://cubeinthebox.com
 * Version: 1.0.0
 * License: GPL2+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 *
 * @package analyze-seo
 */

define( 'WP_SEO_PATH', dirname( __FILE__ ) );
define( 'WP_SEO_URL', trailingslashit( plugins_url( '', __FILE__ ) ) );

//  Exit if accessed directly.
defined('ABSPATH') || exit;

/**
 * Enqueue front end and editor JavaScript and CSS
 */
function analyze_seo_scripts() {
    $blockPath = '/dist/block.js';
    $stylePath = '/dist/block.css';

    // Enqueue the bundled block JS file
    wp_enqueue_script(
        'analyze-seo-block-js',
        plugins_url( $blockPath, __FILE__ ),
        [ 'wp-i18n', 'wp-edit-post', 'wp-element', 'wp-editor', 'wp-components', 'wp-data', 'wp-plugins', 'wp-edit-post', 'wp-api' ],
        filemtime( plugin_dir_path(__FILE__) . $blockPath )
    );

    // Enqueue frontend and editor block styles
    wp_enqueue_style(
        'analyze-seo-block-css',
        plugins_url ($stylePath, __FILE__),
        '',
        filemtime( plugin_dir_path(__FILE__) . $stylePath )
    );

}
// Hook scripts function into block editor hook
add_action('enqueue_block_assets', 'analyze_seo_scripts');

include_once WP_SEO_PATH . '/includes/seo-metaboxes.php';



