<?php
/**
 * Register plugin's required metaboxes
 * Generates title tag and meta tags
 * @package analyze-seo/inlcudes
*/

/**
 * [register_seo_metaboxes]
 * Register the meta filed in REST API
*/
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
    
    register_meta('post', 'objective_words_cc', $args);
    register_meta('post', 'title_tag_cc', $args);
    register_meta('post', 'meta_description_cc', $args);
    register_meta('post', 'meta_keywords_cc', $args);

    register_meta('post', 'body_content_cc', $args);
    register_meta('post', 'alt_attribute_cc', $args);
    register_meta('post', 'permalink_cc', $args);

    register_meta('post', 'objective_words_mc', $args);
    register_meta('post', 'title_tag_mc', $args);
    register_meta('post', 'meta_description_mc', $args);
    register_meta('post', 'meta_keywords_mc', $args);
    register_meta('post', 'body_content_mc', $args);
    register_meta('post', 'alt_attribute_mc', $args);
    register_meta('post', 'permalink_mc', $args);
}
add_action('init', 'register_seo_metaboxes');

/**
 * [register_api_post_meta]
 * Register rest route for update the meta value
*/
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


/**
 * [update_metaboxes_callback] 
 * Update post meta
*/
function update_metaboxes_callback($data){
    return update_post_meta($data['id'], $data['key'], $data['value']);
}

