/**
 * Internal block libraries
 */
const {__} = wp.i18n;
const {PluginSidebar,PluginSidebarMoreMenuItem} = wp.editPost;
const {PanelBody,TextControl, TextareaControl} = wp.components;
const {Component,Fragment} = wp.element;
const {withSelect} = wp.data;
const {registerPlugin} = wp.plugins;
const {addAction} = wp.hooks;

import Signal from './components/signal.js';
import Match from './components/match.js';

class SeoAnalysis extends Component{

	constructor(props){
		super(props);

		//Binding methods
		this.handleInputChange = this.handleInputChange.bind(this);

		this.state = {
			objective_words: {
				meta:{key: '',value: ''},
				color_code: {key: 'objective_words_cc',value: 'red'}
			},
			title_tag: {
				meta:{key: '',value: ''},
				color_code: {key: 'title_tag_cc',value: 'red'}
			},
			meta_description: {
				meta:{key: '',value: ''},
				color_code: {key: 'meta_description_cc',value: 'red'}
			},
			meta_keywords: {
				meta:{key: '',value: ''},
				color_code: {key: 'meta_keywords_cc',value: 'red'}
			},
			body_content: {
				color_code:{key: 'body_content_cc',value: 'red'}
			},
			alt_attribute:{
				color_code: {key: 'alt_attribute_cc', value: 'red'}
			}
		}//End state

		wp.apiFetch({
			path: `/wp/v2/posts/${this.props.postId}`,
			method: 'GET'
		}).then( (data) => {
			// console.log(data.meta);
			this.setState({
				objective_words: {
					meta:{key: 'objective_words',value: data.meta.objective_words},
					color_code:{key: 'objective_words_cc', value: data.meta.objective_words_cc}
				}, 
				title_tag: {
					meta: {key: 'title_tag',value: data.meta.title_tag},
					color_code:{key: 'title_tag_cc', value: data.meta.title_tag_cc}
				},
				meta_description: {
					meta:{key: 'meta_description',value: data.meta.meta_description},
					color_code:{key: 'meta_description_cc', value: data.meta.meta_description_cc}
				},
				meta_keywords: {
					meta:{key: 'meta_keywords',value: data.meta.meta_keywords},
					color_code:{key: 'meta_keywords_cc', value: data.meta.meta_keywords_cc}
				},
				body_content: {
					color_code:{key: 'body_content_cc',value: data.meta.body_content_cc}
				},
				alt_attribute:{
					color_code: {key: 'alt_attribute_cc', value: data.meta.alt_attribute_cc}
				}
			});
			return data; 
		}, (err) =>{
			return err;
		});
	}//End constructor

	static getDerivedStateFromProps(nextProps, state){
		const {alt_attribute, body_content} = state;
		if( (nextProps.isPublishing || nextProps.isSaving) && !nextProps.isAutoSaving ){
			let arr_state = Object.values(state);
			for(let i = 0; i<arr_state.length; i++ ){
				if(arr_state[i].meta){
					wp.apiRequest({
						path: `seo-analysis/v2/update-meta?id=${nextProps.postId}`,
						method: 'POST',
						data: arr_state[i].meta
					}).then((data)=>{
						if(arr_state[i].color_code){
							wp.apiRequest({
								path: `seo-analysis/v2/update-meta?id=${nextProps.postId}`,
								method: 'POST',
								data: arr_state[i].color_code
							})
							.then((data)=>{
								return data;
							},(err)=>{
								return err;
							});
						}
						//return data;
					},(err)=>{
						return err;
					});
				}else if(arr_state[i].color_code){
					wp.apiRequest({
						path: `seo-analysis/v2/update-meta?id=${nextProps.postId}`,
						method: 'POST',
						data: arr_state[i].color_code
					})
					.then((data)=>{
						return data;
					},(err)=>{
						return err;
					});
				}
			}
		}//end if is saving || is publishing
	}//End getDerivedStateFromProps

	componentDidUpdate(prevProps, prevState){
		const {content_count} = prevProps;
		let color_code = '';
		if(content_count < 300){
			color_code = 'red';
		}else if(content_count > 300 && content_count < 400){
			color_code = 'orange';
		}else{
			color_code = 'green';
		}

		if(prevState.body_content.color_code.value != color_code){
			this.setState({
				body_content: {
					color_code: { key: 'body_content_cc', value: color_code }
				}
			});
		}

		//Alt Attribute check
		const {media} = prevProps;
		console.log(typeof(media));
		if(media !== undefined && media !== null){
			let color_code = '';
			const {alt_text} = media;
			let alt_text_length = alt_text.split(' ').length;
			if(alt_text_length < 6 || alt_text_length > 12){
				color_code = 'red';
			}else if(alt_text_length >= 6 && alt_text_length <= 12){
				color_code = 'green';
			}

			if(prevState.alt_attribute.color_code.value !== color_code){
				this.setState({
					alt_attribute:{
						color_code:{key: 'alt_attribute_cc', value: color_code}
					}
				});
			}
		}
	}

	handleInputChange(event){
		const target = event.target;
		const value = target.value;
		const name = target.name;
		let value_count = target.value.split(' ');
		let color_code = '';
		if(name === 'objective_words'){
			if(value_count.length === 4){
				color_code = 'green';
			}else if(value_count.length < 4 && value_count.length < 1){
				color_code = 'orange';
			}else{
				color_code = 'red';
			}
		}else if(name == 'meta_description'){
			if(value_count.length === 24){
				color_code = 'green'
			}else if(value_count.length >= 12 &&  value_count.length < 24){
				color_code = 'orange';
			}else{
				color_code = 'red';
			}
		}else if(name === 'title_tag'){
			if(value_count.length < 6 || value_count.length > 8){
				color_code = 'red';
			}else if(value_count.length >= 6 && value_count.length <= 8){
				color_code = 'green';
			}
		}else if(name === 'meta_keywords'){
			let keyword_count = target.value.split(',');
			if(keyword_count.length < 6 || keyword_count.length > 12){
				color_code = 'red';
			}else if(keyword_count.length >= 6 || keyword_count.length <= 12){
				color_code = 'green';
			}
		}else{
			if(value_count.length >= 6 && value_count.length <= 12){
				color_code = 'green';
			}else{
				color_code = 'red';
			}
		}

		//Setting State fron onChange
		this.setState({
			[name]: {
				meta:{
					key: name,
					value: value
				},
				color_code: {
					key: `${[name]}_cc`,
					value: color_code 
				}
			}
		});
	}//end handle input change

	render(){
		return(
			<Fragment>
				<PluginSidebarMoreMenuItem target="seo-analysis">
					{ __('SEO Analysis') }
				</PluginSidebarMoreMenuItem>
				<PluginSidebar name="seo-analysis" title={__( 'Seo Analysis', 'analyze-seo' )}>
					<PanelBody className="seo-analysis-panel">
						<label for="objective_words">{__('Objective Words', 'analyze-seo')}</label><br/>
						<input name="objective_words" value={this.state.objective_words.meta.value} onChange={this.handleInputChange}/><br/>
						<em>{__('This should be at least 4 words', 'analyze-seo')}</em><br/><br/>

						<label for="title_tag">{__('Title Tag', 'analyze-seo')}</label><br/>
						<input name="title_tag" value={this.state.title_tag.meta.value} onChange={this.handleInputChange}/><br/>
						<em>{__('It should be between 6 and 8 words long and it hasn\'t have more than 60 characters', 'analyze-seo')}</em><br/><br/>

						<label for="meta_description">{__('Meta Description', 'analyze-seo')}</label><br/>
						<textarea name="meta_description" onChange={this.handleInputChange} rows="5" placeholder="Meta description">
							{this.state.meta_description.meta.value}
						</textarea><br/>
						<em>{__('It should be between 12 and 24 words long', 'analyze-seo')}</em><br/><br/>

						<label for="meta_keywords">{__('Meta Keywords', 'analyze-seo')}</label><br/>
						<textarea name="meta_keywords" onChange={this.handleInputChange} rows="5" placeholder="Meta keywords">
							{this.state.meta_keywords.meta.value}
						</textarea>
						<em>{__('It should be between 6 and 12 words long', 'analyze-seo')}</em><br/><br/>

						<div className="indicator_section">
							<h2>{__('Word Count & Word Match', 'analyze-seo')}</h2>
							<table>
								<thead>
									<tr>
										<th>Section</th>
										<th>Count</th>
										<th>Match</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>Objective Words</td>
										<td><Signal status_count={this.state.objective_words.color_code.value} /></td>
										<td><Match status_match="red" /></td>
									</tr>
									<tr>
										<td>Title Tag</td>
										<td><Signal status_count={this.state.title_tag.color_code.value} /></td>
										<td><Match status_match="red" /></td>
									</tr>
									<tr>
										<td>Meta Description</td>
										<td><Signal status_count={this.state.meta_description.color_code.value} /></td>
										<td><Match status_match="red" /></td>
									</tr>
									<tr>
										<td>Meta Keywords</td>
										<td><Signal status_count={this.state.meta_keywords.color_code.value} /></td>
										<td><Match status_match="red" /></td>
									</tr>
									<tr>
										<td>Body Content</td>
										<td><Signal status_count={this.state.body_content.color_code.value} /></td>
										<td><Match status_match="red" /></td>
									</tr>
									<tr>
										<td>Image Alt Text</td>
										<td><Signal status_count={this.state.alt_attribute.color_code.value} /></td>
										<td><Match status_match="red" /></td>
									</tr>
								</tbody>
							</table>
						</div>
					</PanelBody>
				</PluginSidebar>
			</Fragment>
		);
	}
};//End Class Definition

//Higer-Order-Component
const HOC = withSelect((select, {forceIsSaving})=>{
	const {getMedia} = select('core');
	const { getCurrentPostId, isSavingPost, isPublishingPost, isAutosavingPost, getEditedPostAttribute, isTyping } = select('core/editor');
	const featuredImageId = getEditedPostAttribute('featured_media');
	const content = getEditedPostAttribute('content');
	let cleanStr = content.replace(/<[^>]*>/g, '');
	let word_arr = cleanStr.split(' ');

	return {
		postId: getCurrentPostId(),
		isSaving: forceIsSaving || isSavingPost(),
		isAutoSaving: isAutosavingPost(),
		isPublishing: isPublishingPost(),
		isTyping: isTyping(),
		media: featuredImageId ? getMedia(featuredImageId) : null,
		content_count: content ? word_arr.length : null
	};

})( SeoAnalysis );

registerPlugin( 'seo-analysis-gutenberg', {
	icon: 'editor-spellcheck',
	render: HOC,
});