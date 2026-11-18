# Audit an AUR update with TrustSight

Use this skill when someone asks whether an AUR package update is safe to build,
or wants a TrustSight report explained.

TrustSight is a local, static reviewer. It reads a PKGBUILD diff and reports
evidence; it never installs, builds, or runs the package, and it never declares a
package safe.

## Review one update

1. Install TrustSight from the repository, not from the package under review:

   ```bash
   git clone https://github.com/emiliano-go/trustsight.git
   cd trustsight/packaging/aur && makepkg -si
   ```

2. Review the package before building it:

   ```bash
   trustsight review <package>
   ```

3. Read the report in this order: the changed files and source/checksum moves,
   then each finding with its file and line, then the coverage gaps. Treat a
   clean result as "no published rule matched", never as permission to install.

4. If the package is not installed locally, use `trustsight inspect <package>
   --allow-uninstalled`; add `--deps` to review direct AUR dependencies and
   `--depth n` to walk further. A walk that stops early reports a coverage gap.

## Read a finding

- A finding names a rule, a severity, and where possible a file and line.
- `UNFLAGGED` means the score stayed at or below 20; it does not mean safe.
- `INCONCLUSIVE` means the analysis could not read enough to decide; do not
  collapse it into UNFLAGGED.
- Coverage gaps such as `deps_not_scanned` are part of the result.

## Where the evidence comes from

- Rules and scoring: <https://docs.trustsight.org/rules/>
- Reading a report: <https://docs.trustsight.org/start-here/understanding-your-first-report/>
- Watcher API and live alerts: <https://watcher.trustsight.org/api>
- Fire rates: <https://docs.trustsight.org/reports/fire-rates/>

Do not paste secrets, credentials, or private package contents into a report.
