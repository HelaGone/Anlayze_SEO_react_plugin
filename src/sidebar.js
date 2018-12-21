/**
 * Internal block libraries
 */
const { __ } = wp.i18n;
const {PluginSidebar,PluginSidebarMoreMenuItem} = wp.editPost;
const {PanelBody,TextControl, TextareaControl} = wp.components;
const {Component,Fragment} = wp.element;
const { withSelect } = wp.data;
const { registerPlugin } = wp.plugins;


class SeoAnalysis extends Component{

	constructor(props){
		super(props);
		this.state = {
			objective_words: {
				key: '',
				value: ''
			},
			title_tag: {
				key: '',
				value: ''
			},
			meta_description: {
				key: '',
				value: ''
			},
			meta_keywords: {
				key: '',
				value: ''
			}
		}//End state

		wp.apiFetch({
			path: `/wp/v2/posts/${this.props.postId}`,
			method: 'GET'
		})
		.then( (data) => {
			this.setState({
				objective_words: {
					key: 'objective_words',
					value: data.meta.objective_words
				}, 
				title_tag: {
					key: 'title_tag',
					value: data.meta.title_tag
				},
				meta_description: {
					key: 'meta_description',
					value: data.meta.meta_description
				},
				meta_keywords: {
					key: 'meta_keywords',
					value: data.meta.meta_keywords
				}
			});
			return data; 
		}, (err) =>{
			return err;
		});

		this.handleInputChange = this.handleInputChange.bind(this);
	}

	static getDerivedStateFromProps(nextProps, state){
		if( (nextProps.isPublishing || nextProps.isSaving) && !nextProps.isAutoSaving ){
			let arr_state = Object.values(state);	
			for(let i = 0; i<arr_state.length; i++ ){
				wp.apiRequest({
					path: `seo-analysis/v2/update-meta?id=${nextProps.postId}`,
					method: 'POST',
					data: arr_state[i]
				})
				.then((data)=>{
					return data;
				},(err)=>{
					return err;
				});
			}
		}
	}//End getDerivedStateFromProps

	handleInputChange(event){
		const target = event.target;
		const value = target.value;
		const name = target.name;

		this.setState({
			[name]: {
				key: name,
				value: value
			}
		});

	}

	render(){
		return(
			<Fragment>
				<PluginSidebarMoreMenuItem target="seo-analysis">
					{ __('SEO Analysis') }
				</PluginSidebarMoreMenuItem>
				<PluginSidebar name="seo-analysis" title={__( 'Seo Analysis', 'analyze-seo' )}>
					<PanelBody className="seo-analysis-panel">
						<label for="objective_words">{__('Objective Words', 'analyze-seo')}</label><br/>
						<input name="objective_words" value={this.state.objective_words.value} onChange={this.handleInputChange}/><br/>
						<em>{__('This should be at least 4 words', 'analyze-seo')}</em><br/>

						<label for="title_tag">{__('Title Tag', 'analyze-seo')}</label><br/>
						<input name="title_tag" value={this.state.title_tag.value} onChange={this.handleInputChange}/><br/>
						<em>{__('It should be between 6 and 8 words long and it hasn\'t have more than 60 characters', 'analyze-seo')}</em><br/>

						<label for="meta_description">{__('Meta Description', 'analyze-seo')}</label><br/>
						<textarea name="meta_description" onChange={this.handleInputChange} rows="5" placeholder="Meta description">
							{this.state.meta_description.value}
						</textarea><br/>
						<em>{__('It should be between 12 and 24 words long', 'analyze-seo')}</em><br/>

						<label for="meta_keywords">{__('Meta Keywords', 'analyze-seo')}</label><br/>
						<textarea name="meta_keywords" onChange={this.handleInputChange} rows="5" placeholder="Meta keywords">
							{this.state.meta_keywords.value}
						</textarea>
						<em>{__('It should be between 6 and 12 words long', 'analyze-seo')}</em><br/>

						<div className="indicator_section">
							<h2>{__('Word Count & Word Match', 'analyze-seo')}</h2>
						</div>
					</PanelBody>
				</PluginSidebar>
			</Fragment>
		);
	}
}

//Higer-Order-Component
const HOC = withSelect((select, {forceIsSaving})=>{
	const { getCurrentPostId, isSavingPost, isPublishingPost, isAutosavingPost } = select('core/editor');
	return {
		postId: getCurrentPostId(),
		isSaving: forceIsSaving || isSavingPost(),
		isAutoSaving: isAutosavingPost(),
		isPublishing: isPublishingPost()
	};
})( SeoAnalysis );

registerPlugin( 'seo-analysis-gutenberg', {
	icon: 'editor-spellcheck',
	render: HOC,
});