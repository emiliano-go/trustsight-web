import figures from './figures.generated.json'

export const RELEASE_TAG = `v${figures.version}`

const clone = (url) => `git clone -b ${RELEASE_TAG} ${url}`

export const INSTALL = {
  https: [
    clone('https://github.com/emiliano-go/trustsight'),
    'cd trustsight/packaging/aur && makepkg -si',
    'trustsight review',
  ].join('\n'),
  ssh: [
    clone('git@github.com:emiliano-go/trustsight'),
    'cd trustsight/packaging/aur && makepkg -si',
    'trustsight review',
  ].join('\n'),
}
