import { CONTENT_URL, NEWS_URL } from "../config";
import { NewsDetail, NewsFeed } from "../types";

export class Api {
	xhr: XMLHttpRequest
	url: string
 
	constructor(url: string) {
		this.xhr = new XMLHttpRequest()
		this.url = url
	}
	// getRequest<AjaxResponse>(cb: (data: AjaxResponse) => void): void {
	// 	this.xhr.open('GET', this.url);
	// 	this.xhr.addEventListener('load', () => {
	// 		cb(JSON.parse(this.xhr.response) as AjaxResponse)
	// 	})
	// 	this.xhr.send();
	// }
	// getRequestPromise<AjaxResponse>(cb: (data: AjaxResponse) => void): void {
	// 	fetch(this.url)
	// 	.then(response => response.json())
	// 	.then(cb)
	// 	.catch(() => {
	// 		console.error('데이터를 불러오지 못했습니다.')
	// 	})
	// }
	async request<AjaxResponse>(): Promise<AjaxResponse> {
		const response = await fetch(this.url)
		return await response.json() as AjaxResponse
	}
	
}

export class NewsFeedApi extends Api{
	constructor(pageNumber: number) {
		super(NEWS_URL.replace('@num', String(pageNumber)))
	}
	async getData(): Promise<NewsFeed[]> {
		return await this.request<NewsFeed[]>();
	}
	// getData(cb: (data: NewsFeed[]) => void): void {
	// 	return this.getRequest<NewsFeed[]>(cb);
	// }
	// getDataPromise(cb: (data: NewsFeed[]) => void): void {
	// 	return this.getRequestPromise<NewsFeed[]>(cb);
	// }
}

export class NewsDetailApi extends Api{
	constructor(id: string) {
		super(CONTENT_URL.replace('@id', id))
	}
	async getData(): Promise<NewsDetail> {
		return await this.request<NewsDetail>();
	}
	// getData(cb: (data: NewsDetail) => void): void {
	// 	return this.getRequest<NewsDetail>(cb);
	// }
	// getDataPromise(cb: (data: NewsDetail) => void): void {
	// 	return this.getRequestPromise<NewsDetail>(cb);
	// }
}

// interface NewsFeedApi extends Api {};
// interface NewsDetailApi extends Api {};
// applyApiMixins(NewsFeedApi, [Api])
// applyApiMixins(NewsDetailApi, [Api])
// function applyApiMixins(targetClass: any, baseClasses: any[]): void {
// 	baseClasses.forEach(baseClass => {
// 		Object.getOwnPropertyNames(baseClass.prototype).forEach(name => {
// 			const descritor = Object.getOwnPropertyDescriptor(baseClass.prototype, name);

// 			if (descritor) {
// 				Object.defineProperty(targetClass.prototype, name, descritor)
// 			}
// 		})
// 	})
// }
