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
			_meta_objective: {
				meta:{key: '',value: ''},
				color_code: {key: '_meta_objective_cc',value: 'red'},
				match: {key: '_meta_objective_mc', value: 'red'}
			},
			_meta_title: {
				meta:{key: '',value: ''},
				color_code: {key: '_meta_title_cc',value: 'red'},
				match: {key: '_meta_title_mc', value: 'red'}
			},
			_meta_description: {
				meta:{key: '',value: ''},
				color_code: {key: '_meta_description_cc',value: 'red'},
				match: {key: '_meta_description_mc', value: 'red'}
			},
			_meta_keywords: {
				meta:{key: '',value: ''},
				color_code: {key: '_meta_keywords_cc',value: 'red'},
				match: {key: '_meta_keywords_mc', value: 'red'}
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
			//console.log(data.meta);
			this.setState({
				_meta_objective: {
					meta:{key: '_meta_objective',value: (data.meta._meta_objective) ? data.meta._meta_objective : ''},
					color_code:{key: '_meta_objective_cc', value: (data.meta._meta_objective_cc) ? data.meta._meta_objective_cc : 'red'},
					match: {key: '_meta_objective_mc', value: (data.meta._meta_objective_mc) ? data.meta._meta_objective_mc : 'red'}
				}, 
				_meta_title: {
					meta: {key: '_meta_title',value: (data.meta._meta_title) ? data.meta._meta_title : ''},
					color_code:{key: '_meta_title_cc', value: (data.meta._meta_title_cc) ? data.meta._meta_title_cc : 'red'},
					match: {key: '_meta_title_mc', value: (data.meta._meta_title_mc) ? data.meta._meta_title_mc : 'red'}
				},
				_meta_description: {
					meta:{key: '_meta_description',value: (data.meta._meta_description) ? data.meta._meta_description : ''},
					color_code:{key: '_meta_description_cc', value: (data.meta._meta_description_cc) ? data.meta._meta_description_cc : 'red'},
					match: {key: '_meta_description_mc', value: (data.meta._meta_description_mc) ? data.meta._meta_description_mc : 'red'}
				},
				_meta_keywords: {
					meta:{key: '_meta_keywords',value: (data.meta._meta_keywords) ? data.meta._meta_keywords : ''},
					color_code:{key: '_meta_keywords_cc', value: (data.meta._meta_keywords_cc) ? data.meta._meta_keywords_cc : 'red'},
					match: {key: '_meta_keywords_mc', value: (data.meta._meta_keywords_mc) ? data.meta._meta_keywords_mc : 'red'}
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
			// console.log(arr_state);
			const iterate = arr_state.map(element => {
				let nobj = [element.meta, element.color_code, element.match];
				return nobj;
			});
			for(let i=0; i<iterate.length; i++){
				for(let j=0; j<iterate[i].length; j++){
					if(iterate[i][j] !== undefined){
						let actual_data = iterate[i][j];
						// console.log(actual_data);
						wp.apiRequest({
							path: `seo-analysis/v2/update-meta?id=${nextProps.postId}`,
							method: 'POST',
							data: actual_data
						}).then((data)=>{
							return data;
						},(err)=>{
							return err;
						});
					}
				}
			}
		}
	}//End getDerivedStateFromProps

	componentDidUpdate(prevProps, prevState){
		const {_meta_objective} = prevState;
		//Body Content
		const {content_count, actual_content} = prevProps;
		if(content_count !== undefined && content_count !== 0){
			let color_code = '';
			if(content_count < 300){
				color_code = 'red';
			}else if(content_count > 300 && content_count < 400){
				color_code = 'orange';
			}else{
				color_code = 'green';
			}

			if(_meta_objective.meta.value !== null && actual_content !== null){
				const content_check = check_match(_meta_objective.meta.value, actual_content);
				let match_color = (content_check) ? 'green' : 'red';

				if(color_code !== prevState.body_content.color_code.value || prevState.body_content.match.value !== match_color){
					//console.log(`${match_color} is the color for body content match`);
					this.setState({
						body_content: {
							color_code: { key: 'body_content_cc', value: color_code },
							match: {key: 'body_content_mc', value: match_color}
						}
					});
				}
			}
		}

		//Alt Attribute check
		const {media} = prevProps;
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

			if(_meta_objective.meta.value !== null && alt_text !== null){
				const alt_check = check_match(_meta_objective.meta.value, alt_text);
				if(alt_check){
					match_color = 'green';
				}else{
					match_color = 'red';
				}

				if(color_code !== prevState.alt_attribute.color_code.value || match_color !== prevState.alt_attribute.match.value){
					// console.log(`${match_color} is the color for alt attribute match`);
					this.setState({
						alt_attribute:{
							color_code:{key: 'alt_attribute_cc', value: color_code},
							match: {key: 'alt_attribute_mc', value: match_color}
						}
					});
				}
			}
		}

		//Permalink Check
		const {permalink} = prevProps;
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

				if(_meta_objective.meta.value !== null && slug[1] !== null){
					let clean_slug = slug[1].replace(/\-/g, ' ');
					const permalink_check = check_match(_meta_objective.meta.value, clean_slug);
					let match_color = ''//(permalink_check) ? 'green' : 'red';

					if(permalink_check){
						match_color = 'green';
					}else{
						match_color = 'red';
					}

					if(color_code !== prevState.permalink.color_code.value || match_color !== prevState.permalink.match.value){
						// console.log(`${match_color} is the color for permalink match`);
						this.setState({
							permalink: {
								color_code: {key: 'permalink_cc', value: color_code},
								match: {key: 'permalink_mc', value: match_color}
							}
						});
					}
				}
			}
		}

	}//end did update

	handleInputChange(event){
		const target = event.target;
		const value = target.value;
		const name = target.name;
		let value_count = target.value.split(' ');
		let color_code = '';
		let match_color = '';
		const {_meta_objective} = this.state;
		if(name === '_meta_objective'){
			let ow_count = target.value.split(', ');
			if(ow_count.length === 4){
				color_code = 'green';
			}else if(ow_count.length < 4 && ow_count.length > 1){
				color_code = 'orange';
			}else{
				color_code = 'red';
			}
		}else if(name == '_meta_description'){
			if(value_count.length === 24){
				color_code = 'green'
			}else if(value_count.length >= 12 &&  value_count.length < 24){
				color_code = 'orange';
			}else{
				color_code = 'red';
			}
		}else if(name === '_meta_title'){
			if(value_count.length < 6 || value_count.length > 12){
				color_code = 'red';
			}else if(value_count.length >= 6 && value_count.length <= 12){
				color_code = 'green';
			}
		}else if(name === '_meta_keywords'){
			let keyword_count = target.value.split(', ');
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

		if(name !== '_meta_objective'){
			let objective_words = _meta_objective.meta.value;
			match_color = check_match(objective_words, value) ? 'green' : 'red';
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
						<label for="_meta_objective">{__('Objective Words', 'analyze-seo')}</label><br/>
						<input name="_meta_objective" value={this.state._meta_objective.meta.value} onChange={this.handleInputChange}/><br/>
						<em>{__('This should be up to 4 words', 'analyze-seo')}</em><br/><br/>

						<label for="_meta_title">{__('Title Tag', 'analyze-seo')}</label><br/>
						<input name="_meta_title" value={this.state._meta_title.meta.value} onChange={this.handleInputChange}/><br/>
						<em>{__('It should be between 6 and 12 words long and it hasn\'t have more than 60 characters', 'analyze-seo')}</em><br/><br/>

						<label for="_meta_description">{__('Meta Description', 'analyze-seo')}</label><br/>
						<textarea name="_meta_description" onChange={this.handleInputChange} rows="5" placeholder="Meta description">
							{this.state._meta_description.meta.value}
						</textarea><br/>
						<em>{__('It should be between 12 and 24 words long', 'analyze-seo')}</em><br/><br/>

						<label for="_meta_keywords">{__('Meta Keywords', 'analyze-seo')}</label><br/>
						<textarea name="_meta_keywords" onChange={this.handleInputChange} rows="5" placeholder="Meta keywords">
							{this.state._meta_keywords.meta.value}
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
										<td><Signal status_count={this.state._meta_objective.color_code.value} /></td>
										{/*<td><Match status_match={this.state._meta_objective.match.value} /></td>*/}
									</tr>
									<tr>
										<td>Title Tag</td>
										<td><Signal status_count={this.state._meta_title.color_code.value} /></td>
										<td><Match status_match={this.state._meta_title.match.value} /></td>
									</tr>
									<tr>
										<td>Meta Description</td>
										<td><Signal status_count={this.state._meta_description.color_code.value} /></td>
										<td><Match status_match={this.state._meta_description.match.value} /></td>
									</tr>
									<tr>
										<td>Meta Keywords</td>
										<td><Signal status_count={this.state._meta_keywords.color_code.value} /></td>
										<td><Match status_match={this.state._meta_keywords.match.value} /></td>
									</tr>
									<tr>
										<td>Body Content</td>
										<td><Signal status_count={this.state.body_content.color_code.value} /></td>
										<td><Match status_match={this.state.body_content.match.value} /></td>
									</tr>
									<tr>
										<td>Image Alt Text</td>
										<td><Signal status_count={this.state.alt_attribute.color_code.value} /></td>
										<td><Match status_match={this.state.alt_attribute.match.value} /></td>
									</tr>
									<tr>
										<td>Permalink</td>
										<td><Signal status_count={this.state.permalink.color_code.value} /></td>
										<td><Match status_match={this.state.permalink.match.value} /></td>
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
	let check = false;
	if(ow !== '' && haystack !== ''){
		// console.log(`not empty`);
		let clean_ow = ow.replace(/\,/g, '').toLowerCase();
		const ow_arr = clean_ow.split(' ');

		let clean_haystack = haystack.replace(/\,/g, '');
		const haystack_arr = clean_haystack.toLowerCase().split(' ');

		let nObj = {};
		const intersection = ow_arr.map(needle => {
			haystack_arr.map((hay, index)=>{
				if(needle !== '' && hay !== ''){
					if(needle === hay){
						console.log(`found: ${needle} in ${hay}`);
						nObj[needle] = true;
					}
				}
			})
			return nObj;
		});

		console.log(intersection[0]);
		let count = 0;
		for(let prop in intersection[0]){
			if(intersection[0].hasOwnProperty(prop)){
				count++;
			}
		}

		if(count === ow_arr.length){
			check = true;
		}
	}
	return (check) ? check : false;
}

//Higer-Order-Component
const HOC = withSelect((select, {forceIsSaving})=>{
	const {getMedia} = select('core');
	const { getCurrentPostId, isSavingPost, isPublishingPost, isAutosavingPost, getEditedPostAttribute, isTyping, getPermalink} = select('core/editor');
	const featuredImageId = getEditedPostAttribute('featured_media');
	const content = getEditedPostAttribute('content');
	const permalink = getPermalink();
	let cleanContent = content.replace(/<[^>]*>/g, '').replace(/&#?[a-z0-9]+;/igm, ' ').replace(/[\.,\/#!¿?$%\^&\*;:{}=\-_`~()]/gm, '').toLowerCase();
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