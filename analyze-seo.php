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
 * Text Domain: analyze-seo
 * Domain Path: /languages 
 * @package analyze-seo
 */

define( 'SEO_ANALYSIS_PATH', dirname( __FILE__ ) );
define( 'SEO_ANALYSIS_URL', trailingslashit( plugins_url( '', __FILE__ ) ) );

//  Exit if accessed directly.
defined('ABSPATH') || exit;

include_once SEO_ANALYSIS_PATH . '/includes/seo-metaboxes.php';

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
// Enqueue scripts in all admin pages
// add_action('enqueue_block_assets', 'analyze_seo_scripts');
add_action('enqueue_block_editor_assets', 'analyze_seo_scripts');

if(!function_exists('currentpost_title_tag')){
    function currentpost_title_tag($title){
        global $wp_query;
        if(is_single()){
            $post_object = $wp_query->queried_object;
            $post_id = $post_object->ID;
            $title_tag = get_post_meta($post_id, 'title_tag', true);
            return $title_tag;
        }
        return $title;
    }
    add_action('pre_get_document_title', 'currentpost_title_tag', 10, 1);
}