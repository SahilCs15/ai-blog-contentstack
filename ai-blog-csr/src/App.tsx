import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import { defaultLocale } from './lib/locale'
import { DEFAULT_REGION, isKnownRegion } from './lib/regions'
import Home from './pages/Home'
import BlogList from './pages/BlogList'
import PostDetail from './pages/PostDetail'
import Topics from './pages/Topics'
import Tools from './pages/Tools'
import ToolDetail from './pages/ToolDetail'
import Companies from './pages/Companies'
import CompanyDetail from './pages/CompanyDetail'
import Models from './pages/Models'
import ModelDetail from './pages/ModelDetail'
import News from './pages/News'
import NewsDetail from './pages/NewsDetail'
import Tutorials from './pages/Tutorials'
import TutorialDetail from './pages/TutorialDetail'
import Glossary from './pages/Glossary'
import UseCases from './pages/UseCases'
import UseCaseDetail from './pages/UseCaseDetail'
import Comparisons from './pages/Comparisons'
import ComparisonDetail from './pages/ComparisonDetail'
import Reports from './pages/Reports'
import ReportDetail from './pages/ReportDetail'
import AllFields from './pages/AllFields'
import GraphqlFields from './pages/GraphqlFields'
import { Empty } from './components/States'

// Canonicalize any path to `/:region/:locale/...`. If the first segment isn't a
// known region, prepend the default region; then ensure a locale segment. So
// `/blog` → `/dev11/en-us/blog`, `/dev23` → `/dev23/en-us`. Region as a path
// segment (not a query) survives the Visual Builder appending an entry's `url`.
function RedirectToDefaults() {
  const { pathname, search } = useLocation()
  const segs = pathname.split('/').filter(Boolean)
  let region = DEFAULT_REGION
  let rest = segs
  if (isKnownRegion(segs[0])) {
    region = segs[0]
    rest = segs.slice(1)
  }
  const hasLocale = rest[0] && /^[a-z]{2}(-[a-z0-9]+)?$/i.test(rest[0])
  const locale = hasLocale ? rest[0] : defaultLocale
  const tail = hasLocale ? rest.slice(1) : rest
  const target = `/${region}/${locale}${tail.length ? '/' + tail.join('/') : ''}${search}`
  return <Navigate to={target} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path=":region/:locale" element={<Layout />}>
        <Route index element={<Home />} />

        <Route path="blog" element={<BlogList />} />
        <Route path="blog/:slug" element={<PostDetail />} />
        <Route path="topics" element={<Topics />} />

        <Route path="tools" element={<Tools />} />
        <Route path="tools/:slug" element={<ToolDetail />} />

        <Route path="companies" element={<Companies />} />
        <Route path="companies/:slug" element={<CompanyDetail />} />

        <Route path="models" element={<Models />} />
        <Route path="models/:slug" element={<ModelDetail />} />

        <Route path="news" element={<News />} />
        <Route path="news/:slug" element={<NewsDetail />} />

        <Route path="tutorials" element={<Tutorials />} />
        <Route path="tutorials/:slug" element={<TutorialDetail />} />

        <Route path="glossary" element={<Glossary />} />

        <Route path="use-cases" element={<UseCases />} />
        <Route path="use-cases/:slug" element={<UseCaseDetail />} />

        <Route path="compare" element={<Comparisons />} />
        <Route path="compare/:slug" element={<ComparisonDetail />} />

        <Route path="reports" element={<Reports />} />
        <Route path="reports/:slug" element={<ReportDetail />} />

        <Route path="all-fields" element={<AllFields />} />
        <Route path="graphql" element={<GraphqlFields />} />

        <Route path="*" element={<Empty title="Page not found" hint="Try the homepage or the tools directory." />} />
      </Route>

      {/* Any path missing a region/locale prefix → canonicalize. */}
      <Route path="*" element={<RedirectToDefaults />} />
    </Routes>
  )
}
