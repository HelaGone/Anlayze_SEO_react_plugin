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
include_once SEO_ANALYSIS_PATH . '/php/taxonomy_settings.php';



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



/**
 * Taxonomy SEO fields
*/

if(is_admin()){
    add_action( 'admin_init', 'add_term_boxes', 10, 1);
}

/**
 * Add the meta box to taxonomies with per-term fields enabled.
 */
function add_term_boxes() {
    foreach ( Taxonomy_settings()->get_enabled_taxonomies() as $slug ) {
        add_action( $slug . '_add_form_fields', 'add_term_meta_fields', 10, 2 );
        add_action( $slug . '_edit_form','edit_term_meta_fields', 10, 2 );
    }
    add_action( 'created_term', 'save_term_fields', 10, 3 );
    add_action( 'edited_term', 'save_term_fields', 10, 3 );
}

/**
 * Helper to get the translated <noscript> text for the character count.
 *
 * @param  string $text The text to count.
 * @return string The text to go between the <noscript> tags.
 */
function noscript_character_count( $text ) {
    return sprintf( __( '%d (save changes to update)', 'analyze-seo' ), strlen( $text ) );
}

/**
 * Helper to construct an option name for per-term SEO fields.
 *
 * @param  object $term The term object
 * @return string The option name
 */
function get_term_option_name( $term ) {
    return "analyze-seo-term-{$term->term_taxonomy_id}";
}

/**
 * Display the SEO fields for adding a term.
 *
 * @param string $taxonomy The taxonomy slug.
 */
function add_term_meta_fields( $taxonomy ) {
    wp_nonce_field( plugin_basename( __FILE__ ), 'wp-seo-nonce' );
    ?>
        <h3><?php echo esc_html( 'SEO Fields' ); ?></h3>
        <div class="wp-seo-term-meta-fields">
            <div class="form-field">
                <label for="wp_seo_meta_title"><?php esc_html_e( 'Title Tag', 'analyze-seo' ); ?></label>
                <input type="text" id="wp_seo_meta_title" name="seo_meta[title]" value="" size="96" />
                <p>
                    <?php esc_html_e( 'Title word count: ', 'analyze-seo' ); ?>
                    <span class="title-character-count"></span>
                    <noscript><?php echo esc_html( noscript_character_count( '' ) ); ?></noscript>
                </p>
            </div>
            <div class="form-field">
                <label for="wp_seo_meta_description"><?php esc_html_e( 'Meta Description', 'analyze-seo' ); ?></label>
                <textarea id="wp_seo_meta_description" name="seo_meta[description]" rows="2" cols="96"></textarea>
                <p>
                    <?php esc_html_e( 'Description word count: ', 'analyze-seo' ); ?>
                    <span class="description-character-count"></span>
                    <noscript><?php echo esc_html( noscript_character_count( '' ) ); ?></noscript>
                </p>
            </div>
            <div class="form-field">
                <label for="wp_seo_meta_keywords"><?php esc_html_e( 'Meta Keywords', 'analyze-seo' ) ?></label>
                <textarea id="wp_seo_meta_keywords" name="seo_meta[keywords]" rows="2" cols="96"></textarea>
            </div>
        </div>
    <?php
}

/**
 * Display the SEO fields for editing a term.
 *
 * @param  object $tag The term object
 * @param  string $taxonomy The taxonomy slug
 */
function edit_term_meta_fields( $tag, $taxonomy ) {
    $values = get_option( get_term_option_name( $tag ), array( 'title' => '', 'description' => '', 'keywords' => '', 'objective' => ''));

    wp_nonce_field( plugin_basename( __FILE__ ), 'wp-seo-nonce' );
    ?>
        <h2><?php echo esc_html( 'SEO Fields' ); ?></h2>
        <table class="form-table wp-seo-term-meta-fields">
            <tbody>
                <tr class="form-field">
                    <th scope="row"><label for="wp_seo_meta_title"><?php esc_html_e( 'Title Tag', 'analyze-seo' ); ?></label></th>
                    <td>
                        <input type="text" id="wp_seo_meta_title" name="seo_meta[title]" value="<?php echo esc_attr( $title = $values['title'] ); ?>" size="96" />
                        <p class="description">
                            <?php esc_html_e( 'Title word count: ', 'analyze-seo' ); ?>
                            <span class="title-character-count"></span>
                            <noscript><?php echo esc_html( noscript_character_count( $title ) ); ?></noscript>
                        </p>
                    </td>
                </tr>
                <tr class="form-field">
                    <th scope="row"><label for="wp_seo_meta_description"><?php esc_html_e( 'Meta Description', 'analyze-seo' ); ?></label></th>
                    <td>
                        <textarea id="wp_seo_meta_description" name="seo_meta[description]" rows="2" cols="96"><?php echo esc_textarea( $description = $values['description'] ); ?></textarea>
                        <p class="description">
                            <?php esc_html_e( 'Description word count: ', 'analyze-seo' ); ?>
                            <span class="description-character-count"></span>
                            <noscript><?php echo esc_html( noscript_character_count( $description ) ); ?></noscript>
                        </p>
                    <td>
                </tr>
                <tr class="form-field">
                    <th scope="row"><label for="wp_seo_meta_keywords"><?php esc_html_e( 'Meta Keywords', 'analyze-seo' ) ?></label></th>
                    <td><textarea id="wp_seo_meta_keywords" name="seo_meta[keywords]" rows="2" cols="96"><?php echo esc_textarea( $values['keywords'] ); ?></textarea></td>
                </tr>
            </tbody>
        </table>
    <?php
}

/**
 * Save the SEO term values as an option.
 *
 * @see wp_unslash(), which the Settings API and update_post_meta()
 *     otherwise handle.
 *
 * @param  int $term_id Term ID.
 * @param  int $tt_id Term taxonomy ID.
 * @param  string $taxonomy Taxonomy slug.
 */
function save_term_fields( $term_id, $tt_id, $taxonomy ) {
    if ( ! isset( $_POST['taxonomy'] ) ) {
        return;
    }

    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
        return;
    }

    if ( !has_term_fields( $taxonomy ) ) {
        return;
    }

    $object = get_taxonomy( $taxonomy );
    if ( empty( $object->cap->edit_terms ) || ! current_user_can( $object->cap->edit_terms ) ) {
        return;
    }

    if ( ! isset( $_POST['wp-seo-nonce'] ) ) {
        return;
    }

    if ( ! wp_verify_nonce( $_POST['wp-seo-nonce'], plugin_basename( __FILE__ ) ) ) {
        return;
    }

    if ( ! isset( $_POST['seo_meta'] ) ) {
        $_POST['seo_meta'] = array();
    }

    foreach ( array( 'title', 'description', 'keywords' ) as $field ) {
        $data[ $field ] = isset( $_POST['seo_meta'][ $field ] ) ? sanitize_text_field( wp_unslash( $_POST['seo_meta'][ $field ] ) ) : '';
    }

    $name = get_term_option_name( get_term( $term_id, $taxonomy ) );
    if ( false === get_option( $name ) ) {
        // Don't create an option unless at least one field exists.
        $filtered_data = array_filter( $data );
        if ( ! empty( $filtered_data ) ) {
            add_option( $name, $data, null, false );
        }
    } else {
        update_option( $name, $data );
    }
}


/**
 * [currentpost_title_tag] Updates the title tag in single post
 * @param [string] $title
 * @return [String] $title || $title_tag
*/
if(!function_exists('currentpost_title_tag')){
    function currentpost_title_tag($title){
        global $wp_query;
        if(is_single()){
            $post_object = $wp_query->queried_object;
            $post_id = $post_object->ID;
            $title_tag = get_post_meta($post_id, 'title_tag', true);
            return $title_tag;
        }else if(is_category() || is_tag() || is_tax() ){

        }
        return $title;
    }
    add_action('pre_get_document_title', 'currentpost_title_tag', 10, 1);
}

/**
 * [update_head_meta] Insert meta tags in document header
 * @param [null]
 * 
*/
if(!function_exists('update_head_meta')){
    function update_head_meta(){
        global $wp_query;
        if(is_single()):
            $post_object = $wp_query->queried_object;
            $post_id = $post_object->ID;
            $keywords = get_post_meta($post_id, 'meta_keywords', true);
            $meta_description = get_post_meta($post_id, 'meta_description', true); 
            if($keywords !== '' || $meta_description !== ''): ?>
                <meta name="keywords" content="<?php echo esc_attr($keywords); ?>" />
                <meta name="description" content="<?php echo esc_attr($meta_description); ?>">
<?php
            endif;
        endif;
    }
    add_action('wp_head', 'update_head_meta', 10, 1);
}



