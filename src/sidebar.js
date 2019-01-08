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
				color_code: {key: 'objective_words_cc',value: 'red'},
				match: {key: 'objective_words_mc', value: 'red'}
			},
			title_tag: {
				meta:{key: '',value: ''},
				color_code: {key: 'title_tag_cc',value: 'red'},
				match: {key: 'title_tag_mc', value: 'red'}
			},
			meta_description: {
				meta:{key: '',value: ''},
				color_code: {key: 'meta_description_cc',value: 'red'},
				match: {key: 'meta_description_mc', value: 'red'}
			},
			meta_keywords: {
				meta:{key: '',value: ''},
				color_code: {key: 'meta_keywords_cc',value: 'red'},
				match: {key: 'meta_keywords_mc', value: 'red'}
			},
			body_content: {
				color_code:{key: 'body_content_cc',value: 'red'},
				match: {key: 'body_content_mc', value: 'red'}
			},
			alt_attribute:{
				color_code: {key: 'alt_attribute_cc', value: 'red'},
				match: {key: 'alt_attribute_mc', value: 'red'}
			},
			permalink: {
				color_code: {key:'permalink_cc', value: 'red'},
				match: {key: 'permalink_mc', value: 'red'}
			}
		}//End state

		wp.apiFetch({
			path: `/wp/v2/posts/${this.props.postId}`,
			method: 'GET'
		}).then( (data) => {
			console.log(data.meta);
			this.setState({
				objective_words: {
					meta:{key: 'objective_words',value: (data.meta.objective_words) ? data.meta.objective_words : ''},
					color_code:{key: 'objective_words_cc', value: (data.meta.objective_words_cc) ? data.meta.objective_words_cc : 'red'},
					match: {key: 'objective_words_mc', value: (data.meta.objective_words_mc) ? data.meta.objective_words_mc : 'red'}
				}, 
				title_tag: {
					meta: {key: 'title_tag',value: (data.meta.title_tag) ? data.meta.title_tag : ''},
					color_code:{key: 'title_tag_cc', value: (data.meta.title_tag_cc) ? data.meta.title_tag_cc : 'red'},
					match: {key: 'title_tag_mc', value: (data.meta.title_tag_mc) ? data.meta.title_tag_mc : 'red'}
				},
				meta_description: {
					meta:{key: 'meta_description',value: (data.meta.meta_description) ? data.meta.meta_description : ''},
					color_code:{key: 'meta_description_cc', value: (data.meta.meta_description_cc) ? data.meta.meta_description_cc : 'red'},
					match: {key: 'meta_description_mc', value: (data.meta.meta_description_mc) ? data.meta.meta_description_mc : 'red'}
				},
				meta_keywords: {
					meta:{key: 'meta_keywords',value: (data.meta.meta_keywords) ? data.meta.meta_keywords : ''},
					color_code:{key: 'meta_keywords_cc', value: (data.meta.meta_keywords_cc) ? data.meta.meta_keywords_cc : 'red'},
					match: {key: 'meta_keywords_mc', value: (data.meta.meta_keywords_mc) ? data.meta.meta_keywords_mc : 'red'}
				},
				body_content: {
					color_code:{key: 'body_content_cc',value: (data.meta.body_content_cc) ? data.meta.body_content_cc : 'red'},
					match: {key: 'body_content_mc', value: (data.meta.body_content_mc) ? data.meta.body_content_mc : 'red'}
				},
				alt_attribute:{
					color_code: {key: 'alt_attribute_cc', value: (data.meta.alt_attribute_cc) ? data.meta.alt_attribute_cc : 'red' },
					match: {key: 'alt_attribute_mc', value: (data.meta.alt_attribute_mc) ? data.meta.alt_attribute_mc : 'red'}
				},
				permalink: {
					color_code: {key: 'permalink_cc', value: (data.meta.permalink_cc) ?  data.meta.permalink_cc : 'red'},
					match: {key: 'permalink_mc', value:(data.meta.permalink_mc) ? data.meta.permalink_mc : 'red'}
				}
			});
			return data; 
		}, (err) =>{
			return err;
		});
	}//End constructor

	static getDerivedStateFromProps(nextProps, state){
		if( (nextProps.isPublishing || nextProps.isSaving) && !nextProps.isAutoSaving ){
			let arr_state = Object.values(state);
			const iterate = arr_state.map(element => {
				let nobj = [element.meta, element.color_code, element.match];
				return nobj;
			});

			for(let i=0; i<iterate.length; i++){
				for(let j=0; j<iterate[i].length; j++){
					if(iterate[i][j] !== undefined){
						let actual_data = iterate[i][j];
						console.log(actual_data);
						wp.apiRequest({
							path: `seo-analysis/v2/update-meta?id=${nextProps.postId}`,
							method: 'POST',
							data: actual_data
						}).then((data)=>{
							return data;
						},(err)=>{
							return err;
						});
					}//end if
				}//end for 2
			}//end for 1
			
			/*for(let i = 0; i<arr_state.length; i++ ){
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
				}else if(arr_state[i].match){
					wp.apiRequest({
						path: `seo-analysis/v2/update-meta?id=${nextProps.postId}`,
						method: 'POST',
						data: arr_state[i].match
					})
					.then((data)=>{
						return data;
					},(err)=>{
						return err;
					});
				}
			}*/

		}//end if is saving || is publishing
	}//End getDerivedStateFromProps

	componentDidUpdate(prevProps, prevState){
		const {objective_words} = prevState;

		//Body Content
		/*const {content_count, actual_content} = prevProps;
		if(content_count !== undefined && content_count !== 0){
			let color_code = '';
			let match_color = '';
			if(content_count < 300){
				color_code = 'red';
			}else if(content_count > 300 && content_count < 400){
				color_code = 'orange';
			}else{
				color_code = 'green';
			}

			const content_check = check_match(objective_words.meta.value, actual_content);
			if(content_check){
				match_color = 'green';
			}else{
				match_color = 'red';
			}

			if(color_code !== prevState.body_content.color_code.value){
				console.log('diff');
				console.log(`State: ${prevState.body_content.color_code.value} - color code: ${color_code}`);
				console.log(`Match: ${prevState.body_content.match.value} - match Color: ${match_color}`);

				this.setState({
					body_content: {
						color_code: { key: 'body_content_cc', value: color_code }
					}
				});
			}
		}*/

		//Alt Attribute check
		/*const {media} = prevProps;
		if(media !== undefined && media !== null){
			let color_code = '';
			const {alt_text} = media;
			let alt_text_length = alt_text.split(' ').length;
			let match_color = '';
			if(alt_text_length < 6 || alt_text_length > 12){
				color_code = 'red';
			}else if(alt_text_length >= 6 && alt_text_length <= 12){
				color_code = 'green';
			}

			const alt_check = check_match(objective_words.meta.value, alt_text);
			if(alt_check){
				match_color = 'green';
			}else{
				match_color = 'red';
			}

			if(prevState.alt_attribute.color_code.value !== color_code || prevState.alt_attribute.match.value !== match_color){
				this.setState({
					alt_attribute:{
						color_code:{key: 'alt_attribute_cc', value: color_code},
						match: {key: 'match_aa', value: match_color}
					}
				});
			}
		}*/

		//Permalink Check
		/*const {permalink} = prevProps;
		if(permalink !== undefined && permalink !== null){
			let color_code = '';
			const regexp = /([a-z0-9\-]{1,})\/$/;
			let slug = regexp.exec(permalink);
			if(slug !== null){
				let arr_slug = slug[1].split('-');
				if(arr_slug.length >= 6 && arr_slug.length <= 12){
					color_code = 'green';
				}else{
					color_code = 'red';
				}

				const permalink_check = check_match(objective_words.meta.value, slug[1]);
				let match_color = '';
				if(permalink_check){
					match_color = 'green';
				}else{
					match_color = 'red';
				}

				if(prevState.permalink.color_code.value !== color_code || prevState.permalink.match !== match_color){
					this.setState({
						permalink: {
							color_code: {key: 'permalink_cc', value: color_code},
							match: {key: 'match_pl', value: match_color}
						}
					});
				}
			}
		}*/

	}//end did update

	handleInputChange(event){
		const target = event.target;
		const value = target.value;
		const name = target.name;
		let value_count = target.value.split(' ');
		let color_code = '';
		let match_color = '';
		const obj_wds = this.state.objective_words.meta.value;
		if(name === 'objective_words'){
			let ow_count = target.value.split(', ')
			if(ow_count.length === 4){
				color_code = 'green';
			}else if(ow_count.length < 4 && ow_count.length > 1){
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
			if(value_count.length < 6 || value_count.length > 12){
				color_code = 'red';
			}else if(value_count.length >= 6 && value_count.length <= 12){
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

		
		if(check_match(obj_wds, value)){
			match_color = 'green';
		}else{
			match_color = 'red';
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
				},
				match: {
					key:`${[name]}_mc`, 
					value: match_color
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
						<em>{__('It should be between 6 and 12 words long and it hasn\'t have more than 60 characters', 'analyze-seo')}</em><br/><br/>

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
										<td><Match status_match={this.state.objective_words.match.value} /></td>
									</tr>
									<tr>
										<td>Title Tag</td>
										<td><Signal status_count={this.state.title_tag.color_code.value} /></td>
										<td><Match status_match={this.state.title_tag.match.value} /></td>
									</tr>
									<tr>
										<td>Meta Description</td>
										<td><Signal status_count={this.state.meta_description.color_code.value} /></td>
										<td><Match status_match={this.state.meta_description.match.value} /></td>
									</tr>
									<tr>
										<td>Meta Keywords</td>
										<td><Signal status_count={this.state.meta_keywords.color_code.value} /></td>
										<td><Match status_match={this.state.meta_keywords.match.value} /></td>
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
									<tr>
										<td>Permalink</td>
										<td><Signal status_count={this.state.permalink.color_code.value} /></td>
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


//checking ow matches in haystack
const check_match = (ow, haystack) => {
	if(ow !== null && haystack !== null){
		const ow_lower = ow.toLowerCase();
		const ow_arr = ow_lower.split(', ');
		const haystack_clean = haystack.replace(',', '').replace('.', '').replace(';', '').replace(':', '').replace('"', '').toLowerCase();
		const haystack_arr = haystack_clean.split(' ');
		const intersection = ow_arr.map(word => haystack_arr.includes(word));
		const isMatch = intersection.includes(true);
		return isMatch;
	}
	return false;
}

//Higer-Order-Component
const HOC = withSelect((select, {forceIsSaving})=>{
	const {getMedia} = select('core');
	const { getCurrentPostId, isSavingPost, isPublishingPost, isAutosavingPost, getEditedPostAttribute, isTyping, getPermalink} = select('core/editor');
	const featuredImageId = getEditedPostAttribute('featured_media');
	const content = getEditedPostAttribute('content');
	const permalink = getPermalink();
	let cleanContent = content.replace(/<[^>]*>/g, '');
	let word_arr = cleanContent.split(' ');

	return {
		postId: getCurrentPostId(),
		isSaving: forceIsSaving || isSavingPost(),
		isAutoSaving: isAutosavingPost(),
		isPublishing: isPublishingPost(),
		isTyping: isTyping(),
		media: featuredImageId ? getMedia(featuredImageId) : null,
		content_count: content ? word_arr.length : null, 
		actual_content: content ? cleanContent : null,
		permalink: permalink
	};

})( SeoAnalysis );

registerPlugin( 'seo-analysis-gutenberg', {
	icon: 'editor-spellcheck',
	render: HOC,
});