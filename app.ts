type Store = {
	currentPage: number
	feeds: NewsFeed[]
}

type News = {
	id: number
	time_ago: string
	title: string
	url: string
	user: string
	content: string
}

type NewsFeed = News & {
	comments_count: number
	points: number
	read?: boolean
}

type NewsDetail = News & {
	comments: NewsComment[]
}

type NewsComment = News &  {
	comments: NewsComment[]
	level: number
}

const ajax: XMLHttpRequest = new XMLHttpRequest()
const content: HTMLElement | null = document.createElement('div')
const NEWS_URL = 'https://api.hnpwa.com/v0/news/@num.json'
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json'
const store: Store = {
	currentPage: 1,
	feeds: []
}

function applyApiMixins(targetClass: any, baseClasses: any[]): void {
	baseClasses.forEach(baseClass => {
		Object.getOwnPropertyNames(baseClass.prototype).forEach(name => {
			const descritor = Object.getOwnPropertyDescriptor(baseClass.prototype, name);

			if (descritor) {
				Object.defineProperty(targetClass.prototype, name, descritor)
			}
		})
	})
}

class Api {
	getRequest<AjaxResponse>(url:string): AjaxResponse {
		const ajax = new XMLHttpRequest()
		ajax.open('GET', url, false);
		ajax.send();

		return JSON.parse(ajax.response)
	}
}

class NewsFeedApi{
	getData(pageNumber: number): NewsFeed[] {
		
		return this.getRequest<NewsFeed[]>(NEWS_URL.replace('@num', String(pageNumber)));
	}
}

class NewsDetailApi{
	getData(id: string): NewsDetail {
		
		return this.getRequest<NewsDetail>(CONTENT_URL.replace('@id', id));
	}
}

interface NewsFeedApi extends Api {};
interface NewsDetailApi extends Api {};
applyApiMixins(NewsFeedApi, [Api])
applyApiMixins(NewsDetailApi, [Api])

abstract class View {
	private template: string
	private renderTemplate: string;
	private container: HTMLElement
	private htmlList: string[]

	constructor(containerId: string, template: string) {
		const containerElement = document.getElementById(containerId)
		
		if (!containerElement) {
			throw '최상위 컨테이너가 없어 UI를 진행하지 못합니다.'
		}
		
		this.container = containerElement
		this.template = template
		this.renderTemplate = template
		this.htmlList = []
	}


	protected updateView (): void {
		this.container.innerHTML = this.renderTemplate
		this.renderTemplate = this.template
	}

	protected addHtml(htmlString: string): void {
		this.htmlList.push(htmlString)
	}

	protected getHtml(): string {
		const result = this.htmlList.join('')
		this.clearHtmlList()
		return result
	}

	protected setTemplateData(key: string, value: string): void {
		this.renderTemplate = this.renderTemplate.replace(`{{__${key}__}}`, value)
	}

	private clearHtmlList(): void {
		this.htmlList = []	
	}

	abstract render(): void;
}

class NewsFeedView extends View {
	api:NewsFeedApi;
	feeds: NewsFeed[]
	constructor(containerId:string) {
		let template = `
			<div class="bg-gray-600 min-h-screen">
			<div class="bg-white text-xl">
				<div class="mx-auto px-4">
					<div class="flex justify-between items-center py-6">
						<div class="flex justify-start">
							<h1 class="font-extrabold">Hacker News</h1>
						</div>
						<div class="items-center justify-end">
							<a href="#/page/{{__prev_page__}}" class="text-gray-500">
								Previous
							</a>
							<a href="#/page/{{__next_page__}}" class="text-gray-500 ml-4">
								Next
							</a>
						</div>
					</div> 
				</div>
			</div>
				<div class="p-4 text-2xl text-gray-700">
					{{__news_feed__}}        
				</div>
			</div>
		`

		super(containerId, template)

		this.api = new NewsFeedApi();
		this.feeds = store.feeds;
		
		if(this.feeds.length === 0) {
			this.feeds = store.feeds = this.api.getData(store.currentPage)
			this.makeFeeds()
		}

	}
	
	makeFeeds(): void {
		this.feeds.forEach((el) => {
			el.read = false
		})
	}

	render(): void {
		store.currentPage = Number(location.hash.substr(7) || 1)
		this.feeds.forEach(el => {
			this.addHtml(`
			<div class="p-6 ${el.read ? 'bg-gray-500' : 'bg-white'} mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
			<div class="flex">
				<div class="flex-auto">
					<a href="#/show/${el.id}">${el.title}</a>  
				</div>
				<div class="text-center text-sm">
					<div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${el.comments_count}</div>
				</div>
			</div>
			<div class="flex mt-3">
				<div class="grid grid-cols-3 text-sm text-gray-500">
					<div><i class="fas fa-user mr-1"></i>${el.user ? el.user : ''}</div>
					<div><i class="fas fa-heart mr-1"></i>${el.points ? el.points : 0}</div>
					<div><i class="far fa-clock mr-1"></i>${el.time_ago}</div>
				</div>  
			</div>
		</div>   
			`)
		})
	
		this.setTemplateData('news_feed', this.getHtml())
		this.setTemplateData('prev_page', String(store.currentPage > 1 ? store.currentPage - 1 : 1))
		this.setTemplateData('next_page', String(store.currentPage + 1))
	
		this.updateView()
	}

}

class NewsDetailView extends View {
	constructor(containerId:string) {
		let template = `
		<div class="bg-gray-600 min-h-screen pb-8">
			<div class="bg-white text-xl">
				<div class="mx-auto px-4">
					<div class="flex justify-between items-center py-6">
						<div class="flex justify-start">
							<h1 class="font-extrabold">Hacker News</h1>
						</div>
						<div class="items-center justify-end">
							<a href="#/page/{{__currentPage__}}" class="text-gray-500">
								<i class="fa fa-times"></i>
							</a>
						</div>
					</div>
				</div>
			</div>
	
			<div class="h-full border rounded-xl bg-white m-6 p-4 ">
				<h2>{{__title__}}</h2>
				<div class="text-gray-400 h-20">
					{{__content__}}
				</div>
				{{__comments__}}
			</div>
		</div>
		`
		super(containerId, template)
	}
	render() {
		const id = location.hash.substr(7)
		const api = new NewsDetailApi()
		const newsContent = api.getData(id)

		for(let i=0; i < store.feeds.length; i++) {
			if (store.feeds[i].id === Number(id)) {
				store.feeds[i].read = true;
				break;
			}
		}
	
		this.setTemplateData('comments', this.makeComment(newsContent.comments))
		this.setTemplateData('currentPage', String(store.currentPage))
		this.setTemplateData('title', newsContent.title)
		this.setTemplateData('content', newsContent.content)

		this.updateView()
	}
		
		
	makeComment (comments: NewsComment[], called = 0): string {
		comments.forEach((el:NewsComment) => {
			this.addHtml(`
				<div style="padding-left: ${called * 40}px;" class="mt-4">
				<div class="text-gray-400">
				<i class="fa fa-sort-up mr-2"></i>
				<strong>${el.user}</strong> ${el.time_ago}
				</div>
				<p class="text-gray-700">${el.content}</p>
				</div> 
			`)
					
			if (el.comments.length > 0) {
				this.addHtml(this.makeComment(el.comments, called + 1))
			}
		})
		return this.getHtml()
	}
}

type RouteInfo = {
	path: string;
	page: View;
}

class Router {
	routeTable: RouteInfo[]
	defaultRoute: RouteInfo | null

	constructor() {
		window.addEventListener('hashchange', this.route.bind(this))
		this.routeTable = []
		this.defaultRoute = null
	}
	setDefaultPage(page:View): void {
		this.defaultRoute = {path: '', page}
	}
	addRoutePath(path: string, page:View): void {
		this.routeTable.push({ path, page })
	}
	
	route() {
		const routePath = location.hash;
		
		if (routePath === '' && this.defaultRoute) {
			this.defaultRoute.page.render();
		}

		for (const routeInfo of this.routeTable) {
			if (routePath.indexOf(routeInfo.path) >= 0) {
				routeInfo.page.render()
				break
			}
		}
	}
}

const router:Router = new Router()
const newsFeedView = new NewsFeedView('app')
const newsDetailView = new NewsDetailView('app')

router.setDefaultPage(newsFeedView)
router.addRoutePath('/page/', newsFeedView)
router.addRoutePath('/show/', newsDetailView)
router.route()