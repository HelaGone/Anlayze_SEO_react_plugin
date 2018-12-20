<?php
/**
 * Plugin Name: Analyze SEO
 * Plugin URI: https://cubeinthebox.com/
 * Description: This plugin analyzes SEO in a post
 * Author: Holkan Luna
 * Author URI: http://cubeinthebox.com
 * Version: 1.0.0
 * License: GPL2+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 *
 * @package analyze-seo
 */

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


//Register the meta filed with REST API
function register_seo_metaboxes(){

    $args = array(
        'type'=>'string',
        'description'=>'Belong to SEO fields',
        'single'=>true,
        'show_in_rest'=>true
    );

    register_meta('post', 'objective_words', $args);
    register_meta('post', 'title_tag', $args);
    register_meta('post', 'meta_description', $args);
    register_meta('post', 'meta_keywords', $args);
}
add_action('init', 'register_seo_metaboxes');


//Register rest route for update the meta value
function register_api_post_meta(){
    register_rest_route(
        'seo-analysis/v2',
        '/update-meta',
        array(
            'methods'=>'POST', 
            'callback'=>'update_metaboxes_callback', 
            'args'=>array(
                'id'=>array(
                    'sanitize_callback'=>'absint'
                ),
            ),
        )
    );
}
add_action('rest_api_init', 'register_api_post_meta');

function update_metaboxes_callback($data){
    return update_post_meta($data['id'], $data['key'], $data['value']);
}



