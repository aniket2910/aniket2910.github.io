import type { CaseStudy } from "../types";

// SINGLE SOURCE OF TRUTH — professional work case studies.
// Read via `getCaseStudies()` / `getCaseStudy(slug)`.
//
// Rules for this file: every number must be defensible in an interview, and
// internal system names stay generic (no company-private details).
export const caseStudies: CaseStudy[] = [
  {
    slug: "poison-record-isolation",
    title: "The batch job that stopped lying",
    oneLiner:
      "A reporting job fed by 7+ teams was quietly showing wrong statuses. I made every bad record find itself, so the dashboard never shows a made-up number.",
    context:
      "Pluralsight · Software Engineer II · Curriculum Tool · NestJS, Kafka, PostgreSQL",
    year: "2025",
    featured: true,
    tags: ["Reliability", "Data integrity", "Kafka", "NestJS", "Fault isolation"],
    metrics: [
      { value: "7+", label: "upstream teams", sub: "feeding one reporting table" },
      { value: "100%", label: "data integrity", sub: "on live traffic" },
      { value: "1", label: "record blast radius", sub: "was the whole batch" },
      { value: "log₂n", label: "splits to corner one bad record", sub: "instead of n retries" },
    ],
    situation:
      "Curriculum managers plan content from a dashboard built on a scheduled job that aggregates Kafka data from 7+ upstream teams. When one record in a batch was bad, the job did not fail loudly. It surfaced an incorrect status as if it were correct, which is the worst failure mode there is: nobody knows to distrust it. Finding the culprit meant someone digging through a whole batch in the logs by hand.",
    points: [
      {
        label: "Binary-split isolation",
        body: "When a batch fails, split it in half, re-run each half, and keep halving whatever still fails until every bad record stands alone. One poison record is cornered in about log₂(n) splits instead of n retries, and the good records still commit in bulk.",
      },
      {
        label: "Escalate, never fabricate",
        body: "A record that still fails on its own goes to a dead-letter path and is held out of the aggregate. The dashboard shows either the correct number or a flag that a record is held. Never a guess.",
      },
      {
        label: "Failures that report themselves",
        body: "Each isolated record is posted to the team's Slack channel with its identifier and error, so triage starts with the answer instead of a search.",
      },
      {
        label: "Safe to retry, by construction",
        body: "Every sub-batch commits atomically and a record is marked done only when its write commits. At-least-once processing plus idempotent upserts means a re-run can never half-write or double-count.",
      },
      {
        label: "An owned service, not loose scripts",
        body: "Rebuilt the job as a NestJS service and folded the team's scattered cron scripts into it: dependency injection, unit-testable isolation logic, and one home for config and alerting.",
      },
    ],
    flow: {
      title: "Batch path with binary-split isolation",
      rows: [
        {
          label: "Happy path",
          steps: [
            { title: "Kafka topics", sub: "7+ upstream teams" },
            { title: "Scheduled batch", sub: "NestJS service" },
            { title: "Atomic run", sub: "commit on success" },
            { title: "Reporting table", sub: "idempotent upsert", tone: "ok" },
            { title: "Dashboard", sub: "correct status", tone: "ok" },
          ],
        },
        {
          label: "On failure",
          steps: [
            { title: "Roll back", sub: "nothing half-written" },
            { title: "Split in half", sub: "re-run each side" },
            { title: "Recurse", sub: "into failing halves" },
            { title: "Isolated record", sub: "dead-letter + hold", tone: "bad" },
            { title: "Slack alert", sub: "id + error", tone: "bad" },
          ],
        },
      ],
      caption:
        "Good halves commit as they pass, so the batch keeps moving while the bad record is being cornered.",
    },
    tradeoffs: [
      {
        option: "Skip the bad record and emit anyway",
        verdict: "This was the bug: a wrong status presented as a right one.",
      },
      {
        option: "Fail the whole batch",
        verdict: "Correct, but one bad record blocks every team's data behind it.",
      },
      {
        option: "Retry every record one by one",
        verdict: "Correct, but n round trips even when 99% of the batch is fine.",
      },
      {
        option: "Scale the job up",
        verdict: "The defect was logical, so more compute would only deliver the wrong answer faster.",
      },
    ],
    insight:
      "Scaling would have made the wrong answer arrive faster. The defect was logical, not resource-bound, so the fix lived in the isolation logic: halve until the bad record is alone, and let idempotent writes make every re-run harmless.",
    nextTime:
      "Plant a synthetic bad record in a test batch on every deploy, so the isolation path runs on each release instead of only when production breaks.",
    lab: "poison-record-isolation",
  },
  {
    slug: "160m-backlog-drain",
    title: "Draining 160M records without falling over",
    oneLiner:
      "A Kafka-fed backlog of 160M+ watch-time records had to become a filtered, enriched table without the database or the pods falling over. Position moved into the data, and memory went flat.",
    context:
      "Pluralsight · Software Engineer I · Curriculum Tool · Node.js, PostgreSQL, Kafka, Kubernetes",
    year: "2023",
    featured: true,
    tags: ["Data pipelines", "PostgreSQL", "Kafka", "Idempotency", "Memory"],
    metrics: [
      { value: "160M+", label: "raw records", sub: "years of watch-time history" },
      { value: "~10K", label: "records / minute", sub: "sustained, resumable" },
      { value: "100", label: "records per batch", sub: "memory flat at any slice size" },
      { value: "0", label: "recurring OOM pages", sub: "after bounded batches" },
    ],
    situation:
      "The curriculum portal needed a \"Top 10 Courses\" panel, filtered by curriculum manager and owning domain. The watch data came from another team as a Kafka topic: 160M+ day-wise records per viewer per course, going back years before the portal existed. Most of that history mapped to no content plan at all. My stage had to turn it into an enriched, filterable table, keep up with live volume, and not take the database or the API pods down while doing it.",
    points: [
      {
        label: "An enriched middle table",
        body: "Instead of serving the UI off 160M raw rows, each record is looked up by course and tagged with its owning domain and curriculum manager. Stale history that maps to no plan is dropped, which is why the table ends up far smaller than the source.",
      },
      {
        label: "Position lives in the data",
        body: "A stateless pod that can redeploy has nowhere to keep an offset. A processed flag on the source row, with a partial index on unprocessed rows, made the job resumable across redeploys and its progress queryable. The index shrinks to nothing as the backlog drains.",
      },
      {
        label: "Idempotent by construction",
        body: "The table is keyed one-to-one with source rows (viewer, course, day), so every write is a replace, not a sum. A row's flag flips in the same transaction as its write, so even overlapping runs cause redundant work at worst, never a double count.",
      },
      {
        label: "Bounded batches, flat memory",
        body: "Processing all 10,000 rows of a run at once blew the API pod's memory and paged on-call. Splitting each run into sequential batches of 100, with concurrent lookups inside a batch and one transaction per batch, made peak memory independent of slice size.",
      },
    ],
    flow: {
      title: "From raw topic to enriched table",
      rows: [
        {
          label: "Ingest",
          steps: [
            { title: "Watch-time topic", sub: "another team, per viewer per day" },
            { title: "Internal Kafka platform", sub: "streams into our DB" },
            { title: "Raw table", sub: "160M+ rows · processed = false" },
          ],
        },
        {
          label: "My stage",
          steps: [
            { title: "Cron, every minute", sub: "k8s minimum interval" },
            { title: "Next 10K unprocessed", sub: "partial index scan" },
            { title: "Batches of 100", sub: "sequential, one txn each" },
            { title: "Enriched table", sub: "replace upsert + flag flip", tone: "ok" },
          ],
        },
        {
          label: "Downstream",
          steps: [
            { title: "Daily top-10 job", sub: "reads the enriched table" },
            { title: "Top 10 Courses panel", sub: "instant reads" },
          ],
        },
      ],
      caption:
        "A failed batch rolls back its writes and its flags together, so its 100 rows are simply picked up again on the next run.",
    },
    tradeoffs: [
      {
        option: "Offset pagination",
        verdict: "The offset needs durable storage a stateless pod doesn't have, and OFFSET gets slower the deeper you page into 160M rows.",
      },
      {
        option: "A Postgres cursor",
        verdict: "Lives on the connection, so a redeploy loses the position, and there's no way to watch progress.",
      },
      {
        option: "Summing watch time per course and day",
        verdict: "Overlapping runs would double count. A replace keyed one-to-one with the source can't.",
      },
      {
        option: "More pod memory",
        verdict: "Cut the alerts as a stopgap, but peak memory still grew with the slice. Bounded batches removed the cause.",
      },
    ],
    insight:
      "Put the position in the data, not in the process. A processed flag with a partial index made a stateless job resumable and observable, and bounded batches made memory independent of how much work was waiting.",
    nextTime:
      "A bad record still rolled back its whole batch of 100. I fixed that granularity on a later job with binary-split isolation: see \"The batch job that stopped lying\".",
  },
  {
    slug: "dashboard-15s-to-2s",
    title: "From 15 seconds to 2",
    oneLiner:
      "A key dashboard took 15 seconds to load, long enough that people assumed it was broken. Moving the heavy aggregation off the request path brought it to 2.",
    context:
      "Pluralsight · Software Engineer I · Curriculum Tool · PostgreSQL, Node.js, React",
    year: "2023",
    featured: true,
    tags: ["Performance", "PostgreSQL", "Pre-aggregation", "React"],
    metrics: [
      { value: "87%", label: "latency cut", sub: "15s → 2s" },
      { value: "2s", label: "time to usable screen", sub: "down from ~15s" },
    ],
    situation:
      "A dashboard curriculum teams relied on took about 15 seconds to load. At that point users stop trusting a tool: they assume it's broken and reload, which only adds load. The cost sat in the read path: every request queried a heavy materialized view.",
    points: [
      {
        label: "Move the cost off the request path",
        body: "Replaced the materialized view with scheduled pre-aggregated tables. A background job computes the aggregates and writes plain, indexed rows, so a dashboard request becomes a cheap read of work already done.",
      },
      {
        label: "Tables shaped for the reader",
        body: "The tables carry exactly the columns and indexes the dashboard reads, and the refresh is ordinary code that can be tuned, monitored and fault-isolated, instead of a database view mechanism.",
      },
      {
        label: "A leaner frontend",
        body: "Cleared out old state bloat so rendering wouldn't add its own delay on top of the faster data. The number that matters is time to a usable screen, not query time alone.",
      },
    ],
    flow: {
      title: "Request path, before and after",
      rows: [
        {
          label: "Before",
          steps: [
            { title: "Dashboard request" },
            { title: "API" },
            { title: "Materialized view", sub: "heavy query, every request", tone: "bad" },
            { title: "~15s", sub: "users reload", tone: "bad" },
          ],
        },
        {
          label: "After · on a schedule",
          steps: [
            { title: "Background job", sub: "runs the heavy aggregation" },
            { title: "Pre-aggregated tables", sub: "indexed, shaped for the dashboard" },
          ],
        },
        {
          label: "After · per request",
          steps: [
            { title: "Dashboard request" },
            { title: "API" },
            { title: "Indexed read", sub: "already computed", tone: "ok" },
            { title: "~2s", sub: "usable screen", tone: "ok" },
          ],
        },
      ],
      caption:
        "The expensive work still happens, but once per schedule instead of once per page load.",
    },
    tradeoffs: [
      {
        option: "Throw hardware at the query",
        verdict: "The aggregation would still run on every single request, just a little faster.",
      },
      {
        option: "Refresh the view more cleverly",
        verdict: "Still tied to the view mechanism and still heavy to refresh and query. Owned tables gave control over columns, indexes and the job.",
      },
      {
        option: "Keep it live to the second",
        verdict: "A reporting dashboard doesn't need real-time. Minutes-old data is fine; 15-second loads are not.",
      },
    ],
    insight:
      "Latency paid on every request is a design choice. Moving the aggregation onto a schedule traded to-the-second freshness, which this dashboard never needed, for a 2-second load.",
    nextTime:
      "Measure backend and frontend time separately before and after, so the 87% splits into numbers instead of a judgement call.",
  },
  {
    slug: "react-app-instant",
    title: "Making a React app feel instant",
    oneLiner:
      "First load dropped from ~20s to ~3s, and the busiest form stopped re-rendering top to bottom on every single edit.",
    context:
      "Pluralsight · Software Engineer II · React, TypeScript, Redux, Webpack",
    year: "2025",
    featured: false,
    tags: ["Frontend performance", "React", "Redux", "Code splitting"],
    metrics: [
      { value: "85%", label: "faster first load", sub: "~20s → ~3s" },
      { value: "~40%", label: "fewer re-renders", sub: "on the editing surface" },
    ],
    situation:
      "Two kinds of slow in one product. The first page took around 20 seconds to render. And on the content-editing surface, a metadata form that grew with every new content type re-rendered from top to bottom whenever a single field changed, because every input subscribed to one shared Context.",
    points: [
      {
        label: "Measure before cutting",
        body: "Lighthouse and bundle analysis showed what the first load was actually waiting on across SSR and the client bundle, so the work went to the critical path instead of guesses.",
      },
      {
        label: "Ship only what the route needs",
        body: "Route-level code splitting, dynamic imports for heavy and rarely used parts, and Webpack chunk optimization so shared dependencies cache separately. Initial render went from ~20s to ~3s.",
      },
      {
        label: "Subscribe to slices, not the world",
        body: "A Context provider re-renders every consumer when any part of its value changes. Moving state to Redux with useSelector means a field re-renders only when its own slice changes. The React DevTools Profiler showed ~40% fewer committed renders on the same interaction.",
      },
      {
        label: "One owner for async",
        body: "Redux Saga took over fetching, cancellation and sequencing. takeLatest cancels a stale request when a newer one fires, which removed out-of-order responses on fast interactions.",
      },
      {
        label: "Migrated without a big bang",
        body: "Redux and Context ran side by side; one slice moved at a time, verified in the Profiler, then its Context was deleted. The app stayed shippable at every step.",
      },
    ],
    flow: {
      title: "First load and a single edit, before and after",
      rows: [
        {
          label: "First load · before",
          steps: [
            { title: "Browser" },
            { title: "One large bundle", sub: "everything up front", tone: "bad" },
            { title: "~20s", sub: "to first render", tone: "bad" },
          ],
        },
        {
          label: "First load · after",
          steps: [
            { title: "Browser" },
            { title: "Route chunk", sub: "only this page" },
            { title: "Lazy chunks", sub: "loaded on demand" },
            { title: "~3s", sub: "to first render", tone: "ok" },
          ],
        },
        {
          label: "One edit · before",
          steps: [
            { title: "Field change" },
            { title: "Shared Context", sub: "value reference changes" },
            { title: "Whole form re-renders", tone: "bad" },
          ],
        },
        {
          label: "One edit · after",
          steps: [
            { title: "Field change" },
            { title: "Redux slice", sub: "useSelector" },
            { title: "Only that field re-renders", tone: "ok" },
          ],
        },
      ],
    },
    tradeoffs: [
      {
        option: "Wrap everything in React.memo",
        verdict: "Lowers render cost, but every consumer of a changing Context still re-renders. The subscription model was the problem.",
      },
      {
        option: "RTK Query for data fetching",
        verdict: "The modern default for fetch-and-cache, and my pick on a greenfield app. Saga won here for cancellation and sequencing, and it was already the pattern in the codebase.",
      },
    ],
    insight:
      "Count before you cut. Bundle analysis showed what the first load waited on, and the Profiler showed one edit re-rendering a whole form. Both fixes did less work rather than the same work faster.",
  },
  {
    slug: "building-for-15-teams",
    title: "Building for 15+ teams at once",
    oneLiner:
      "A shared Table that choked on large datasets, and a frontend that had to ship on its own among 30+ teams. Both came down to changing shared things without breaking anyone.",
    context:
      "Pluralsight · Software Engineer II · React, design system, Kubernetes",
    year: "2025",
    featured: false,
    tags: ["Design systems", "Micro-frontends", "React", "API design"],
    metrics: [
      { value: "15+", label: "teams adopted", sub: "server-side pagination" },
      { value: "30+", label: "teams on the platform", sub: "independent deploys" },
    ],
    situation:
      "The product is many independently deployed frontends under one domain, built on a shared design system. The design-system Table paginated only in the browser, so a large dataset had to load in full before the first row appeared. Teams needed server-side pagination, and my team needed to ship its own frontend without coordinating releases with anyone else.",
    points: [
      {
        label: "Server-side pagination, opt-in",
        body: "Added offset/limit API pagination with next and previous controls behind opt-in props. Existing callers change nothing; teams with large datasets switch it on.",
      },
      {
        label: "Same API, same accessibility",
        body: "The Table stayed composable and accessible, so adopting pagination never meant relearning the component.",
      },
      {
        label: "Documented where teams look",
        body: "Every new prop is documented in the shared component library, which is how it reached 15+ teams without a migration plan.",
      },
      {
        label: "A frontend that ships on its own",
        body: "Built and deployed my team's React micro-frontend as a standalone unit with its own backend, composed by route at the Kubernetes Ingress with fully isolated browser state.",
      },
    ],
    flow: {
      title: "Shared Table and the micro-frontend platform",
      rows: [
        {
          label: "Table · before",
          steps: [
            { title: "Table" },
            { title: "Load full dataset", sub: "before the first row", tone: "bad" },
            { title: "Paginate in browser" },
          ],
        },
        {
          label: "Table · after, opt-in",
          steps: [
            { title: "Table" },
            { title: "API offset / limit", sub: "next · previous" },
            { title: "One page of rows", tone: "ok" },
          ],
        },
        {
          label: "Platform",
          steps: [
            { title: "Browser", sub: "one domain" },
            { title: "Kubernetes Ingress", sub: "routes by path" },
            { title: "Team frontend", sub: "own deploy" },
            { title: "Team backend", sub: "data synced over Kafka", tone: "ok" },
          ],
        },
      ],
      caption:
        "Teams are composed by route rather than inside one shared app: a full page load between teams, in exchange for hard isolation and independent releases.",
    },
    tradeoffs: [
      {
        option: "Change the Table's API outright",
        verdict: "Forces every consuming team to migrate at once. Opt-in props let each team adopt on its own schedule.",
      },
      {
        option: "Keep paginating in the browser",
        verdict: "The first row waits for the whole dataset, and memory grows with the data.",
      },
    ],
    insight:
      "Shared code is a contract. Making new behaviour opt-in let 15+ teams adopt server-side pagination on their own schedule, with no coordinated migration.",
  },
];
