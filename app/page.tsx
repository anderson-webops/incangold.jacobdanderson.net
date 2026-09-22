import { ExternalLink, Trophy } from '@/components/static-icons';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const results = [
  {
    rank: 1,
    strategy: 'Leave after 7 treasure or 7 turns',
    score: '17.969',
    margin: '0.068',
    wins: '5/10',
  },
  {
    rank: 2,
    strategy: 'Leave after 8 treasure or 7 turns',
    score: '17.937',
    margin: '0.071',
    wins: '1/10',
  },
  {
    rank: 3,
    strategy: 'Switch after 1 hazards (stay->leave after 7 turns)',
    score: '17.910',
    margin: '0.073',
    wins: '2/10',
  },
  {
    rank: 4,
    strategy: 'Leave after 9 treasure or 7 turns',
    score: '17.900',
    margin: '0.072',
    wins: '0/10',
  },
  {
    rank: 5,
    strategy: 'Leave after 10 treasure or 7 turns',
    score: '17.885',
    margin: '0.073',
    wins: '0/10',
  },
  {
    rank: 6,
    strategy: 'Leave after 11 treasure or 7 turns',
    score: '17.874',
    margin: '0.073',
    wins: '0/10',
  },
  {
    rank: 7,
    strategy: 'Artifact opportunist (<=3 players, 2+ artifacts, base 7 turns)',
    score: '17.871',
    margin: '0.073',
    wins: '0/10',
  },
  {
    rank: 8,
    strategy:
      'Artifact value vs risk (bank 10, risk 2, <=2 players, base 7 turns)',
    score: '17.871',
    margin: '0.073',
    wins: '0/10',
  },
  {
    rank: 9,
    strategy: 'Leave after 6 treasure or 8 turns',
    score: '17.839',
    margin: '0.068',
    wins: '1/10',
  },
  {
    rank: 10,
    strategy: 'Leave after 7 treasure or 8 turns',
    score: '17.788',
    margin: '0.074',
    wins: '1/10',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8 border-l-2 border-gold pl-5 sm:mb-10 sm:pl-7">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-forest/65">
            Incan Gold simulation
          </p>
          <h1 className="font-heading text-[clamp(2.25rem,6vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-forest">
            Strategy results
          </h1>
        </header>

        <section
          aria-labelledby="best-strategy-heading"
          className="relative overflow-hidden rounded-[1.75rem] bg-forest px-6 py-7 text-cream shadow-[0_22px_55px_rgba(10,48,39,0.18)] sm:px-9 sm:py-9"
        >
          <div
            className="absolute inset-x-0 top-0 h-1 bg-gold"
            aria-hidden="true"
          />
          <div className="relative grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-sm font-medium text-gold-light">
                <Trophy className="h-4 w-4" strokeWidth={1.8} />
                Best tested strategy
              </div>
              <h2
                id="best-strategy-heading"
                className="max-w-2xl font-heading text-[clamp(2rem,5vw,3.55rem)] font-semibold leading-[1.02] tracking-[-0.035em]"
              >
                Leave after 7 treasure or 7 turns
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-cream/70">
                It led the runner-up by 0.032 points per player. The paired 95%
                interval for that advantage was 0.005 to 0.059.
              </p>
            </div>

            <div className="border-l border-white/15 pl-5 md:min-w-48 md:pl-7">
              <p className="font-mono text-[clamp(2.9rem,7vw,4.6rem)] font-semibold leading-none tracking-[-0.06em] text-gold-light">
                17.969
              </p>
              <p className="mt-2 text-sm leading-5 text-cream/60">
                average points
                <br />
                per player, per game
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="ranking-heading" className="mt-10 sm:mt-14">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2
                id="ranking-heading"
                className="font-heading text-3xl font-semibold tracking-[-0.025em] text-forest"
              >
                Final ranking
              </h2>
              <p className="mt-1 text-base text-ink-muted">
                The ten finalists, ordered by average score.
              </p>
            </div>
            <p className="rounded-full border border-forest/10 bg-white/55 px-3 py-1.5 text-sm font-medium text-forest/70">
              50,000 games per finalist
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-forest/10 bg-white/75 shadow-[0_12px_35px_rgba(10,48,39,0.07)]">
            <Table className="min-w-[700px] text-[0.9375rem]">
              <TableCaption className="sr-only">
                Final ranking of the ten Incan Gold strategy finalists
              </TableCaption>
              <TableHeader className="bg-forest/[0.045]">
                <TableRow className="border-forest/10 hover:bg-transparent">
                  <TableHead className="h-12 w-16 px-5 text-xs font-semibold uppercase tracking-wider text-forest/55">
                    Rank
                  </TableHead>
                  <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wider text-forest/55">
                    Strategy
                  </TableHead>
                  <TableHead className="h-12 px-4 text-right text-xs font-semibold uppercase tracking-wider text-forest/55">
                    Avg. score
                  </TableHead>
                  <TableHead className="h-12 px-4 text-right text-xs font-semibold uppercase tracking-wider text-forest/55">
                    95% margin
                  </TableHead>
                  <TableHead className="h-12 px-5 text-right text-xs font-semibold uppercase tracking-wider text-forest/55">
                    Batch wins
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow
                    key={result.rank}
                    className={
                      result.rank === 1
                        ? 'border-gold/25 bg-gold/[0.09] hover:bg-gold/[0.12]'
                        : 'border-forest/[0.08] hover:bg-forest/[0.025]'
                    }
                  >
                    <TableCell className="px-5 py-4 font-mono font-semibold text-forest/60">
                      {String(result.rank).padStart(2, '0')}
                    </TableCell>
                    <TableCell className="max-w-xl whitespace-normal px-4 py-4 font-medium leading-6 text-ink">
                      {result.strategy}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right font-mono font-semibold tabular-nums text-forest">
                      {result.score}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right font-mono tabular-nums text-ink-muted">
                      ±{result.margin}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-right font-mono tabular-nums text-ink-muted">
                      {result.wins}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <aside className="mt-8 grid gap-4 rounded-2xl border border-forest/10 bg-cream-deep/65 p-5 text-sm leading-6 text-ink-muted sm:grid-cols-[auto_1fr] sm:gap-6 sm:p-6">
          <p className="font-semibold uppercase tracking-[0.14em] text-forest">
            About the run
          </p>
          <p>
            112 strategies were screened under four-player homogeneous
            self-play. The final evaluation used 10 paired batches of 5,000
            seeded games. Every finalist received the same game-seed schedule.
            These results identify the best strategy in this tested
            configuration, not a universally optimal way to play.
          </p>
        </aside>

        <footer className="mt-8 flex flex-col gap-3 border-t border-forest/10 pt-5 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>Legacy Board Game Arena ruleset · Seed 246813579</p>
          <a
            href="https://github.com/Jacoba1100254352/Incan-Gold-Strategy-Tester"
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-1.5 font-semibold text-forest underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-forest/70 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            View the simulator source
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </footer>
      </div>
    </main>
  );
}
