<?php
class Taxonomy_settings{
	/**
	 * Instance of this class.
	 *
	 * @var object
	 */
	private static $instance = null;

	/**
	 * The default options to save.
	 *
	 * @var array.
	 */
	public $default_options = array();

	/**
	 * Storage unit for the current option values of the plugin.
	 *
	 * @var array.
	 */
	public $options = array();

	/**
	 * Taxonomies with archive pages, which can have meta fields set for them.
	 *
	 * @see  WP_SEO_Settings::setup().
	 *
	 * @var array Term objects.
	 */
	private $taxonomies = array();

	/**
	 * Post types that can be viewed individually and have per-entry meta values.
	 *
	 * @see  WP_SEO_Settings::setup().
	 *
	 * @var array Post type objects.
	 */
	private $single_post_types = array();

	const SLUG = 'analyze-seo';

	public static function instance(){
		if(!isset(self::$instance)){
			self::$instance = new Taxonomy_settings;
			self::$instance->setup();
		}
		return self::$instance;
	}

	protected function setup(){
		add_action( 'wp_loaded', array( $this, 'set_properties' ) );
	}

	public function set_properties(){
		/**
		 * Filter the post types that support per-entry SEO fields.
		 *
		 * @param array Associative array of post type keys and objects.
		 */
		$this->single_post_types = apply_filters( 'wp_seo_single_post_types', wp_list_filter( get_post_types( array( 'public' => true ), 'objects' ), array( 'label' => false ), 'NOT' ) );

		/**
		 * Filter the taxonomies that support SEO fields on term archive pages.
		 *
		 * @param  array Associative array of taxonomy keys and objects.
		 */
		$this->taxonomies = apply_filters( 'wp_seo_taxonomies', wp_list_filter( get_taxonomies( array( 'public' => true ), 'objects' ), array( 'label' => false ), 'NOT' ) );

		/**
		 * Filter the options to save by default.
		 *
		 * These are also the settings shown when the option does not exist,
		 * such as when the the plugin is first activated.
		 *
		 * @param  array Associative array of setting names and values.
		 */
		$this->default_options = apply_filters( 
			'wp_seo_default_options', 
			array( 
				'post_types' => array_keys( $this->single_post_types ), 
				'taxonomies' => array_keys( $this->taxonomies )
			)
		);
	}

	/**
	 * Set $options with the current database value.
	 */
	public function set_options() {
		$this->options = get_option( $this::SLUG, $this->default_options );
	}

	/**
	 * Get an option value.
	 *
	 * @param  string $key The option key sought.
	 * @param  mixed $default Optional default.
	 * @return mixed The value, or null on failure.
	 */
	public function get_option( $key, $default = null ) {
		if ( empty( $this->options ) ) {
			$this->set_options();
		}
		return isset( $this->options[ $key ] ) ? $this->options[ $key ] : $default;
	}

	/**
	 * Get the $taxonomies property.
	 *
	 * @return array @see WP_SEO_Settings::taxonomies.
	 */
	public function get_taxonomies() {
		return $this->taxonomies;
	}

	/**
	 * Get the $single_post_types property.
	 *
	 * @return array @see WP_SEO_Settings::single_post_types.
	 */
	public function get_single_post_types() {
		return $this->single_post_types;
	}

	/**
	 * Get the taxonomies with per-term fields enabled.
	 *
	 * @return array With slugs of any enabled taxonomies.
	 */
	public function get_enabled_taxonomies() {
		return $this->get_option( 'taxonomies', array() );
	}

	/**
	 * Helper to check whether a taxonomy is set in "Add fields to individual."
	 *
	 * @param  string $taxonomy Taxonomy name
	 * @return boolean
	 */
	public function has_term_fields( $taxonomy ) {
		return in_array( $taxonomy, $this->get_enabled_taxonomies() );
	}

	/**
	 * Get the post types with per-entry fields enabled.
	 *
	 * @return array With names of any enabled post types.
	 */
	public function get_enabled_post_types() {
		return $this->get_option( 'post_types', array() );
	}

	/**
	 * Helper to check whether a post type is set in "Add fields to individual."
	 *
	 * @param  string  $post_type Post type name.
	 * @return boolean
	 */
	public function has_post_fields( $post_type ) {
		return in_array( $post_type, $this->get_enabled_post_types() );
	}

}//End Class

function Taxonomy_settings(){
	return Taxonomy_settings::instance();
}
add_action('after_setup_theme', 'Taxonomy_settings', 10, 1);
// END CLASS HELPER
