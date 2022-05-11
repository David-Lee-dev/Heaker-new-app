import { NewsFeed, NewsStore } from "./types";

export default class Store implements NewsStore {
	feeds: NewsFeed[]
	_currentPage: number

	constructor() {
		this.feeds = []
		this._currentPage = 1
	}

	get currentPage() {
		return this._currentPage
	}

	set currentPage(page: number) {
		this._currentPage = page
	}
	get nextPage(): number {
		return this._currentPage + 1
	}
	get prevPage(): number {
		return this._currentPage > 1 ? this._currentPage - 1 : 1
	}

	get numberOfFeed(): number {
		return this.feeds.length
	}

	get hasFeeds(): boolean {
		return this.feeds.length > 0
	}
	getAllFeeds(): NewsFeed[] {
		return this.feeds
	}

	getFeed(postion: number): NewsFeed {
		return this.feeds[postion]
	}

	setFeeds(feeds: NewsFeed[]): void {
		this.feeds = feeds.map(feed => ({
			...feed,
			read: false
		}))
	}
	makeRead(id:number): void {
		console.log(id)
		for(let i = 0; i < this.numberOfFeed ; i++) {
			console.log(this.feeds[i])
			if(this.feeds[i].id === id) {
				this.feeds[i].read = true
				break
			}
		}
	}
}