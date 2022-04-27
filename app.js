const ajax = new XMLHttpRequest()
const content = document.createElement('div')
const NEWS_URL = 'https://api.hnpwa.com/v0/news/@num.json'
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json'
const container = document.getElementById('app')
const store = {
	currentPage: 1,
	feeds: []
}

const getData = (url) => {
	ajax.open('GET', url, false);
	ajax.send();

	return JSON.parse(ajax.response)
}

const makeFeeds = (feeds) => {
	feeds.forEach((el) => {
		el.read = false
	})

	return feeds
}

const getNewsFeed = (pageNumber) => {
	let newsFeed = store.feeds;
	const newsList = []

	if(newsFeed.length === 0) {
		newsFeed = store.feeds =  makeFeeds(getData(NEWS_URL.replace('@num', pageNumber)))
	}

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
	newsFeed.forEach(el => {
		newsList.push(`
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

	template = template.replace('{{__news_feed__}}', newsList.join(''))
	template = template.replace('{{__prev_page__}}', store.currentPage > 1 ? store.currentPage - 1 : 1)
	template = template.replace('{{__next_page__}}', store.currentPage + 1)

	container.innerHTML = template
}

const getNewsDetail = () => {
	const id = location.hash.substr(7)
	const newsContent = getData(CONTENT_URL.replace('@id', id))

	let template = `
	<div class="bg-gray-600 min-h-screen pb-8">
		<div class="bg-white text-xl">
			<div class="mx-auto px-4">
				<div class="flex justify-between items-center py-6">
					<div class="flex justify-start">
						<h1 class="font-extrabold">Hacker News</h1>
					</div>
					<div class="items-center justify-end">
						<a href="#/page/${store.currentPage}" class="text-gray-500">
							<i class="fa fa-times"></i>
						</a>
					</div>
				</div>
			</div>
		</div>

		<div class="h-full border rounded-xl bg-white m-6 p-4 ">
			<h2>${newsContent.title}</h2>
			<div class="text-gray-400 h-20">
				${newsContent.content}
			</div>

			{{__comments__}}

		</div>
	</div>
	`
	store.feeds[store.feeds.findIndex(el => el.id === newsContent.id)].read = true

	const makeComment = (comments, called) => {
		const commentString = []

		comments.forEach(el => {
			commentString.push(`
				<div style="padding-left: ${called * 40}px;" class="mt-4">
					<div class="text-gray-400">
						<i class="fa fa-sort-up mr-2"></i>
						<strong>${el.user}</strong> ${el.time_ago}
					</div>
					<p class="text-gray-700">${el.content}</p>
				</div> 
			`)

			if (el.comments.length > 0) {
				commentString.push(makeComment(el.comments, called + 1))
			}
		})

		return commentString.join('')
	}
	
	container.innerHTML = template.replace('{{__comments__}}', makeComment(newsContent.comments, 0))
}

const router = () => {
	const routePath = location.hash;
	if (routePath === '') {
		getNewsFeed(1)
	} else if (routePath.indexOf('page') >= 0) {
		store.currentPage = Number(routePath.substr(7))
		getNewsFeed(store.currentPage)
	} else {
		getNewsDetail()
	}
}

window.addEventListener('hashchange', router)
router()
