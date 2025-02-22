import store from '@/store'

const modules = [
  {
    scope: 'normal',
    title: 'summary',
    route: 'info',
  },
  {
    scope: 'normal',
    title: 'blocks',
    route: 'blocks',
  },
  {
    scope: 'normal',
    title: 'staking',
    route: 'staking',
  },
  {
    scope: 'normal',
    title: 'governance',
    route: 'governance',
  },
]

function processMenu() {
  const chainMenus = [
    // {
    //   title: 'Home',
    //   route: 'home',
    //   icon: 'HomeIcon',
    // },
    {
      header: 'blockchains',
    },
  ]
  Object.keys(store.state.chains.config).forEach(chain => {
    const menu = {
      title: chain,
      icon: store.state.chains.config[chain].logo,
    }
    const children = []
    modules.forEach(m => {
      if (m.scope.match('normal') || m.scope.match(chain)) {
        children.push({
          // header: `item-${chain}-${m.route}`,
          title: m.title,
          route: { name: m.route, params: { chain } },
        })
      }
    })
    menu.children = children
    chainMenus.push(menu)
  })
  return chainMenus
}

export default processMenu()
