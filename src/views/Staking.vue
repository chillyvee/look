<template>
  <div :class="stakingParameters.bond_denom">
    <div>
      This is a slightly modified from based on Ping.pub. The idea is to provide
      a daily boost to each validator in the lowest 33%.
      <br />
      This is just a quick try at one way to recommend a delegation. It will
      need to be adjusted over time to fit the circumstances, especially for new
      chains.
      <br />
      <div v-if="stakingParameters.bond_denom == 'ujuno'">
        For now we allow up to an average 1000 JUNO over a 3 day period per
        smaller validator. Rapid undelegations will only be recovered up to 1000
        JUNO/3 day rather than trying to fill in the entire undelegation at
        once.
      </div>
      <div v-if="stakingParameters.bond_denom == 'loki'">
        For now we allow up to an average 1000 ODIN over a 3 day period per
        smaller validator. Rapid undelegations will only be recovered up to 1000
        ODIN/3 day rather than trying to fill in the entire undelegation at
        once.
      </div>
      <div v-if="stakingParameters.bond_denom == 'uhuahua'">
        For now we allow up to an average 1000 HUAHUA over a 3 day period per
        smaller validator. Rapid undelegations will only be recovered up to 1000
        HUAHUA/3 day rather than trying to fill in the entire undelegation at
        once.
      </div>
      <div v-if="false">
        <div style="text-align: center; width: 100%">
          <h1>Want to do something cool for us?</h1>
          <b-button
            style="font-size: 2em; width: 60%"
            variant="primary"
            @click="
              show_delegate_modal(
                'digvaloper1y5lpxm5fnquc5njw7mdpk66tfyvkqrgal2q5zd'
              )
            "
          >
            <img
              src="/chill360.png"
              height="175px"
              vertical-align="text-top"
              style="float: left; "
            />
            <br />
            Delegate to Chill Validation
            <br />
            <br />
            (We bring you this web site)
            <br />
            <br />
            [ Yes Click Me ] (Thanks! 😉)
          </b-button>
        </div>
        <div style="clear: both;" />
      </div>
      <div v-if="stakingParameters.bond_denom == 'ncheq'">
        <h2 style="color: red">
          The unit of measure for Cheqd has not been verified. Make small test
          transactions or a test wallet before trying full amounts.
        </h2>
      </div>
      <div v-if="stakingParameters.bond_denom == 'udig'">
        For now we allow up to an average 1000 DIG over a 3 day period per
        smaller validator. Rapid undelegations will only be recovered up to 1000
        DIG/3 day rather than trying to fill in the entire undelegation at once.
        <br />
        <br />
        <div style="text-align: center; width: 100%">
          <h2>Wow that was crazy</h2>
          Thank you for your delegation everybody :) We super super appreciate
          it :)
          <br />
          <br />
          And please please spread out your delegations so that all validators
          get some love :)
          <b-button
            variant="primary"
            class="mr-25 mb-25"
            @click="show_delegate_modal()"
          >
            Delegate
          </b-button>
        </div>
        <div style="clear: both;" />
      </div>
      <br />
      The original staking UI is still available on each Validator's page.
      <br />
      <br />
      Feedback welcome in our <a href="https://discord.gg/aYuNMNsu">Discord</a>
      <br />
      <br />
      <div v-if="stakingParameters.bond_denom == 'udig'">
        <h2>Having a little trouble?</h2>
        <button @click="addDigHack">
          Add $DIG to Keplr
        </button>
        <b>
          &lt;-- If you're having trouble delegating, your Keplr might still be
          on Dig Testnet. Switch to Cosmos, Delete the previous Dig Tesnet, Then
          add this new one.
        </b>
        <br />
        Alternate Method: Use another Chrome profile, Install Keplr, Import your
        account, and add this Dig Network (to avoid disturbing your current
        Keplr settings)
      </div>
      <div v-if="stakingParameters.bond_denom == 'uhuahua'">
        <button @click="addHuahuaHack">
          Add $HUAHUA to Keplr
        </button>
      </div>
      <div v-if="stakingParameters.bond_denom == 'loki'">
        <h2>
          <font color="red">
            DO NOT USE A LEDGER+COSMOS APP FOR ODIN
          </font>
        </h2>
        <b>Odin is officially coin type 494. </b>
        <br />If you enjoy zero support, you may be able to get away using a
        ledger, abusing cointype 118 until a coin type 494 ledger app is
        available. (no idea when, and I don't recommend this unless you enjoy
        self-support)
        <br />
        <br />
        <button @click="addOdinHack494">
          Add Odin to Keplr Type 494 (This is the right official addresss
          matching https://moveto.odinprotocol.io/) - Don't use with ledger +
          cosmos app!
        </button>
        <button @click="addOdinHack">
          Rescue: Add Odin to Keplr CoinType 118 (only if you transferred to a
          strange new address on this site)
        </button>
        <br />
        <br />
        <h2>
          Video tutorial on how to delegate your Odin
          <font color="red">(worth a watch ESPECIALLY @ 7:21)</font>
        </h2>
        <br />
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/R3-bgihRDY8"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    </div>
    <b-card no-body>
      <b-card-header class="d-flex justify-content-between">
        <small class="d-none d-md-block">
          <b-badge variant="danger">
            &nbsp;
          </b-badge>
          Top 33%
          <b-badge variant="warning">
            &nbsp;
          </b-badge>
          Top 67% of Voting Power
        </small>
        <b-card-title>
          <span
            >Validators {{ validators.length }}/{{
              stakingParameters.max_validators
            }}
          </span>
        </b-card-title>
      </b-card-header>
      <b-card-body class="pl-0 pr-0">
        <b-table
          :items="list"
          :fields="validator_fields"
          :sort-desc="true"
          sort-by="tokens"
          striped
          hover
          responsive="sm"
        >
          <!-- A virtual column -->
          <template #cell(index)="data">
            <b-badge :variant="rankBadge(data)">
              {{ data.index + 1 }}
            </b-badge>
          </template>
          <!-- Column: Validator -->
          <template #cell(description)="data">
            <b-media
              vertical-align="center"
              class="text-truncate"
              style="max-width:320px;"
            >
              <template #aside>
                <b-avatar
                  v-if="data.item.avatar"
                  v-b-tooltip.hover.v-primary
                  v-b-tooltip.hover.right="data.item.description.details"
                  size="32"
                  variant="light-primary"
                  :src="data.item.avatar"
                />
                <b-avatar
                  v-if="!data.item.avatar"
                  v-b-tooltip.hover.v-primary
                  v-b-tooltip.hover.right="data.item.description.details"
                >
                  <feather-icon icon="ServerIcon" />
                </b-avatar>
              </template>
              <span class="font-weight-bolder d-block text-nowrap">
                <router-link :to="`./staking/${data.item.operator_address}`">
                  {{ data.item.description.moniker }}
                </router-link>
              </span>
              <small class="text-muted">{{
                data.item.description.website || data.item.description.identity
              }}</small>
            </b-media>
          </template>
          <!-- Token -->
          <template #cell(tokens)="data">
            <div v-if="data.item.tokens > 0" class="d-flex flex-column">
              <span class="font-weight-bold mb-0">{{
                tokenFormatter(data.item.tokens, stakingParameters.bond_denom)
              }}</span>
              <span
                class="font-small-2 text-muted text-nowrap d-none d-lg-block"
                >{{ percent(data.item.tokens / stakingPool) }}%</span
              >
            </div>
            <span v-else>{{ data.item.delegator_shares }}</span>
          </template>
          <!-- Token -->
          <template #cell(changes)="data">
            <small v-if="data.item.changes > 0" class="text-success"
              >+{{ data.item.changes }}</small
            >
            <small v-else-if="data.item.changes === 0">-</small>
            <small v-else class="text-danger">{{ data.item.changes }}</small>
          </template>
          <!-- Token -->
          <template #cell(ltchange)="data">
            <small v-if="data.item.ltchange > 0" class="text-success"
              >+{{ data.item.ltchange }}</small
            >
            <small v-else-if="data.item.ltchange === 0">-</small>
            <small v-else class="text-danger">{{ data.item.ltchange }}</small>
          </template>
          <!-- Token -->
          <template #cell(operation)="data">
            <div v-if="rankSoFar(data) == 'primary'">
              <div
                v-if="giveLittleMore(data, stakingParameters.bond_denom) > 0"
              >
                Target:
                {{
                  tokenFormatter(
                    giveLittleMore(data, stakingParameters.bond_denom),
                    stakingParameters.bond_denom
                  )
                }}
                More
                <br />
                <b-button
                  variant="primary"
                  class="mr-25 mb-25"
                  @click="show_delegate_modal(data.item.operator_address)"
                >
                  Delegate
                </b-button>

                <div
                  v-if="
                    tokenFormatter(
                      giveLittleMore(data, stakingParameters.bond_denom),
                      stakingParameters.bond_denom
                    ) == '999999 DIG'
                  "
                >
                  <span style="font-weight: bold; color: green;"
                    >Sponsor the Hungry :)</span
                  >
                </div>
              </div>
              <div v-else>
                Target Reached :)
              </div>
            </div>
            <small v-else-if="rankSoFar(data) == 'danger'" class="text-danger"
              >Top 33% Already
            </small>
            <small v-else-if="rankSoFar(data) == 'warning'" class="text-warning"
              >Top 67% Already
            </small>
          </template>
        </b-table>
      </b-card-body>
    </b-card>
    <operation-delegate-component :validator-address="validator_address" />
  </div>
</template>

<script>
import {
  BTable,
  BMedia,
  BAvatar,
  BBadge,
  BCard,
  BCardHeader,
  BCardTitle,
  VBTooltip,
  BCardBody,
  BButton,
} from 'bootstrap-vue'
import { Validator, percent, StakingParameters, formatToken } from '@/libs/data'
import { keybase } from '@/libs/fetch'
// import { toHex } from '@cosmjs/encoding'
// import fetch from 'node-fetch'
import OperationDelegateComponent from './OperationDelegateComponent.vue'

export default {
  components: {
    BCard,
    BTable,
    BMedia,
    BAvatar,
    BBadge,
    BCardHeader,
    BCardTitle,
    BCardBody,
    BButton,
    OperationDelegateComponent,
  },
  directives: {
    'b-tooltip': VBTooltip,
  },
  data() {
    return {
      islive: true,
      validator_address: null,
      mintInflation: 0,
      stakingPool: 1,
      stakingParameters: new StakingParameters(),
      validators: [new Validator()],
      delegations: [new Validator()],
      changes: {},
      ltchange: {},
      validator_fields: [
        {
          key: 'index',
          label: '#',
          tdClass: 'd-none d-md-block',
          thClass: 'd-none d-md-block',
        },
        { key: 'description', label: 'Validator' },
        {
          key: 'tokens',
          label: 'Voting Power',
          sortable: true,
          tdClass: 'text-right',
          thClass: 'text-right',
          sortByFormatted: true,
        },
        {
          key: 'changes',
          label: '24H Changes',
        },
        {
          key: 'ltchange',
          label: '3D Changes',
          sortable: true,
        },
        {
          key: 'commission',
          formatter: value => `${percent(value.rate)}%`,
          tdClass: 'text-right',
          thClass: 'text-right',
          sortable: true,
          sortByFormatted: true,
        },
        {
          key: 'operation',
          label: '',
          tdClass: 'text-right',
          thClass: 'text-right',
        },
      ],
    }
  },
  computed: {
    list() {
      return this.validators.map(x => {
        const xh = x
        const change = this.changes[x.consensus_pubkey.value]
        if (change) {
          xh.changes = change.latest - change.previous
        }
        const ltchanges = this.ltchange[x.consensus_pubkey.value]
        if (ltchanges) {
          xh.ltchange = ltchanges.latest - ltchanges.previous
        }
        return xh
      })
    },
  },
  created() {
    this.$http.getValidatorListByHeight('latest').then(data => {
      // Determine starting height, do not go below zero
      let height = Number(data.block_height)
      if (height > 14400) {
        height -= 14400
      } else {
        height = 1
      }
      const changes = []
      data.validators.forEach(x => {
        changes[x.pub_key.value] = {
          latest: Number(x.voting_power),
          previous: 0,
        }
      })

      // Determine previous powers
      this.$http.getValidatorListByHeight(height).then(previous => {
        previous.validators.forEach(x => {
          if (changes[x.pub_key.value]) {
            changes[x.pub_key.value].previous = Number(x.voting_power)
          } else {
            changes[x.pub_key.value] = {
              latest: 0,
              previous: Number(x.voting_power),
            }
          }
        })
        this.$set(this, 'changes', changes)
      })

      // check back 1 week
      let lwheight = Number(data.block_height)
      const lwdelta = 14440 * 3
      if (lwheight > lwdelta) {
        lwheight -= lwdelta
      } else {
        lwheight = 1
      }
      const ltchange = []
      data.validators.forEach(x => {
        ltchange[x.pub_key.value] = {
          latest: Number(x.voting_power),
          previous: 0,
        }
      })
      this.$http.getValidatorListByHeight(lwheight).then(previous => {
        previous.validators.forEach(x => {
          if (ltchange[x.pub_key.value]) {
            ltchange[x.pub_key.value].previous = Number(x.voting_power)
          } else {
            ltchange[x.pub_key.value] = {
              latest: 0,
              previous: Number(x.voting_power),
            }
          }
        })
        this.$set(this, 'ltchange', ltchange)
      })
    })

    this.$http.getStakingParameters().then(res => {
      this.stakingParameters = res
    })

    this.$http.getValidatorList().then(res => {
      const identities = []
      const temp = res
      let total = 0
      for (let i = 0; i < temp.length; i += 1) {
        total += temp[i].tokens
        const { identity } = temp[i].description
        const url = this.$store.getters['chains/getAvatarById'](identity)
        if (url) {
          temp[i].avatar = url
        } else if (identity && identity !== '') {
          identities.push(identity)
        }
      }
      this.stakingPool = total
      this.validators = temp

      // fetch avatar from keybase
      let promise = Promise.resolve()
      identities.forEach(item => {
        promise = promise.then(
          () =>
            // eslint-disable-next-line implicit-arrow-linebreak
            new Promise(resolve => {
              this.avatar(item, resolve)
              // eslint-disable-next-line comma-dangle
            })
        )
      })
    })
  },
  beforeDestroy() {
    this.islive = false
  },
  methods: {
    addHuahuaHack() {
      window.keplr.experimentalSuggestChain({
        chainId: 'chihuahua-1',
        chainName: 'Chihuahua',
        rpc: 'https://rpc.chihuahua.wtf',
        rest: 'https://api.chihuahua.wtf',
        bip44: {
          coinType: 118,
        },
        bech32Config: {
          bech32PrefixAccAddr: 'chihuahua',
          bech32PrefixAccPub: 'chihuahua' + 'pub',
          bech32PrefixValAddr: 'chihuahua' + 'valoper',
          bech32PrefixValPub: 'chihuahua' + 'valoperpub',
          bech32PrefixConsAddr: 'chihuahua' + 'valcons',
          bech32PrefixConsPub: 'chihuahua' + 'valconspub',
        },
        currencies: [
          {
            coinDenom: 'HUAHUA',
            coinMinimalDenom: 'uhuahua',
            coinDecimals: 6,
            coinGeckoId: 'HUAHUA',
          },
        ],
        feeCurrencies: [
          {
            coinDenom: 'HUAHUA',
            coinMinimalDenom: 'uhuahua',
            coinDecimals: 6,
            coinGeckoId: 'HUAHUA',
          },
        ],
        stakeCurrency: {
          coinDenom: 'HUAHUA',
          coinMinimalDenom: 'uhuahua',
          coinDecimals: 6,
          coinGeckoId: 'HUAHUA',
        },
        coinType: 118,
        gasPriceStep: {
          low: 0.025,
          average: 0.035,
          high: 0.04,
        },
      })
    },
    addDigHack() {
      window.keplr.experimentalSuggestChain({
        chainId: 'dig-1',
        chainName: 'Dig',
        rpc: 'https://digrpc.chillvalidation.com',
        rest: 'https://digapi.chillvalidation.com',
        bip44: {
          coinType: 118,
        },
        bech32Config: {
          bech32PrefixAccAddr: 'dig',
          bech32PrefixAccPub: 'dig' + 'pub',
          bech32PrefixValAddr: 'dig' + 'valoper',
          bech32PrefixValPub: 'dig' + 'valoperpub',
          bech32PrefixConsAddr: 'dig' + 'valcons',
          bech32PrefixConsPub: 'dig' + 'valconspub',
        },
        currencies: [
          {
            coinDenom: 'DIG',
            coinMinimalDenom: 'udig',
            coinDecimals: 6,
            coinGeckoId: 'DIG',
          },
        ],
        feeCurrencies: [
          {
            coinDenom: 'DIG',
            coinMinimalDenom: 'udig',
            coinDecimals: 6,
            coinGeckoId: 'DIG',
          },
        ],
        stakeCurrency: {
          coinDenom: 'DIG',
          coinMinimalDenom: 'udig',
          coinDecimals: 6,
          coinGeckoId: 'DIG',
        },
        coinType: 118,
        gasPriceStep: {
          low: 0.025,
          average: 0.035,
          high: 0.04,
        },
      })
    },
    addOdinHack() {
      window.keplr.experimentalSuggestChain({
        chainId: 'odin-mainnet-freya',
        chainName: 'Odin',
        rpc: 'https://odinrpc.chillvalidation.com',
        rest: 'https://odinapi.chillvalidation.com',
        bip44: {
          coinType: 118,
        },
        bech32Config: {
          bech32PrefixAccAddr: 'odin',
          bech32PrefixAccPub: 'odin' + 'pub',
          bech32PrefixValAddr: 'odin' + 'valoper',
          bech32PrefixValPub: 'odin' + 'valoperpub',
          bech32PrefixConsAddr: 'odin' + 'valcons',
          bech32PrefixConsPub: 'odin' + 'valconspub',
        },
        currencies: [
          {
            coinDenom: 'odin',
            coinMinimalDenom: 'loki',
            coinDecimals: 6,
            coinGeckoId: 'odin',
          },
        ],
        feeCurrencies: [
          {
            coinDenom: 'odin',
            coinMinimalDenom: 'loki',
            coinDecimals: 6,
            coinGeckoId: 'odin',
          },
        ],
        stakeCurrency: {
          coinDenom: 'odin',
          coinMinimalDenom: 'loki',
          coinDecimals: 6,
          coinGeckoId: 'odin',
        },
        coinType: 118,
        gasPriceStep: {
          low: 0.01,
          average: 0.025,
          high: 0.03,
        },
      })
    },
    addOdinHack494() {
      window.keplr.experimentalSuggestChain({
        chainId: 'odin-mainnet-freya',
        chainName: 'Odin',
        rpc: 'https://odinrpc.chillvalidation.com',
        rest: 'https://odinapi.chillvalidation.com',
        bip44: {
          coinType: 494,
        },
        bech32Config: {
          bech32PrefixAccAddr: 'odin',
          bech32PrefixAccPub: 'odin' + 'pub',
          bech32PrefixValAddr: 'odin' + 'valoper',
          bech32PrefixValPub: 'odin' + 'valoperpub',
          bech32PrefixConsAddr: 'odin' + 'valcons',
          bech32PrefixConsPub: 'odin' + 'valconspub',
        },
        currencies: [
          {
            coinDenom: 'odin',
            coinMinimalDenom: 'loki',
            coinDecimals: 6,
            coinGeckoId: 'odin',
          },
        ],
        feeCurrencies: [
          {
            coinDenom: 'odin',
            coinMinimalDenom: 'loki',
            coinDecimals: 6,
            coinGeckoId: 'odin',
          },
        ],
        stakeCurrency: {
          coinDenom: 'odin',
          coinMinimalDenom: 'loki',
          coinDecimals: 6,
          coinGeckoId: 'odin',
        },
        coinType: 494,
        gasPriceStep: {
          low: 0.01,
          average: 0.025,
          high: 0.03,
        },
      })
    },
    selectValidator(da) {
      this.validator_address = da
    },
    percent,
    tokenFormatter(amount, denom) {
      return formatToken({ amount, denom }, {}, 0)
    },
    giveLittleMore(data, bond_denom) {
      console.log('giveLittleMore', data, bond_denom)
      if (bond_denom == 'udig') {
        if (data.item.description.moniker == 'Chill Validation') {
          return 999999 * 1e6
        }
      }

      // if node did not get at least 1% more today, encourage it
      const onepct = Math.max(
        Math.min(1000, Math.floor(data.item.delegator_shares / 1e6 / 100)), // At most 1000
        100 // at least 100
      )
      console.log(data, onepct)

      if (data.item.ltchange > onepct) {
        // If we already got a lot recently, don't ask for more
        return 0 // no more
      }

      // check how much we're missing
      let locallt = data.item.ltchange
      if (locallt === undefined) {
        locallt = 0
      }
      let localchange = data.item.change
      if (localchange === undefined) {
        localchange = 0
      }
      let missing = onepct - locallt

      // quick exit if 0 missing
      if (missing === 0) return 0

      // for sudden deallocations, we're not trying to fill in giant gaps
      // example if we lost -50000, we're not going to target +51000 to bring you back up
      if (data.item.changes < 0) {
        // in that case, we are only targeting a max of +1000 for today
        missing = Math.min(onepct, 1000) - localchange
      }

      // if missing a lot, then be reasonable
      // soft limit at 1000 to encourage delegation lower
      if (missing > 1000) {
        missing = 1000
      }

      // just missing a nominal amount
      if (bond_denom == 'ncheq') {
        return missing * 1e9
      }
      return missing * 1e6
    },
    rankSoFar() {
      // avoid gloval var change in rankBadge()
      const rank = window.sum / this.stakingPool
      if (rank < 0.333) {
        return 'danger'
      }
      if (rank < 0.67) {
        return 'warning'
      }
      return 'primary'
    },
    rankBadge(data) {
      const { index, item } = data
      if (index === 0) {
        window.sum = item.tokens
      } else {
        window.sum += item.tokens
      }
      const rank = window.sum / this.stakingPool
      if (rank < 0.333) {
        return 'danger'
      }
      if (rank < 0.67) {
        return 'warning'
      }
      return 'primary'
    },
    avatar(identity, resolve) {
      if (this.islive) {
        keybase(identity).then(d => {
          resolve()
          if (Array.isArray(d.them) && d.them.length > 0) {
            const pic = d.them[0].pictures
            if (pic) {
              const validator = this.validators.find(
                u => u.description.identity === identity
              )
              this.$set(validator, 'avatar', pic.primary.url)
              this.$store.commit('cacheAvatar', {
                identity,
                url: pic.primary.url,
              })
            }
          }
        })
      }
    },
    show_delegate_modal(address) {
      this.$set(this, 'validator_address', address)
      this.$nextTick(() => {
        this.$bvModal.show('delegate-window')
      })
    },
  },
}
</script>
