import Router from "./core/router"
import { NewsDetailView, NewsFeedView } from "./page"
import Store from "./store"
import { NewsStore } from "./types"

const store:NewsStore = new Store()

const router:Router = new Router()
const newsFeedView = new NewsFeedView('app', store)
const newsDetailView = new NewsDetailView('app', store)

router.setDefaultPage(newsFeedView)
router.addRoutePath('/page/', newsFeedView)
router.addRoutePath('/show/', newsDetailView)
router.route()