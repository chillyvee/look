<template>
  <div>
    <div>
      This is a slightly modified from based on Ping.pub.  The idea is to provide a daily boost to each validator in the lowest 33%.
      <br>
      This is just a quick try at one way to recommend a delegation.  It will need to be adjusted over time to fit the circumstances, especially for new chains.
      <br>
      For now we allow up to an average 1000 JUNO over a 3 day period per smaller validator.  Rapid undelegations will only be recovered up to 1000 JUNO/3 day rather than trying to fill in the entire undelegation at once.
      <br>
      The original staking UI is still available on each Validator's page.
      <br>
      <br>
      Feedback welcome in our <a href='https://discord.gg/aYuNMNsu'>Discord</a>
    </div>
    <b-card
      no-body
    >
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
          <span>Validators {{ validators.length }}/{{ stakingParameters.max_validators }} </span>
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
                <router-link
                  :to="`./staking/${data.item.operator_address}`"
                >
                  {{ data.item.description.moniker }}
                </router-link>
              </span>
              <small
                class="text-muted"
              >{{ data.item.description.website || data.item.description.identity }}</small>
            </b-media>
          </template>
          <!-- Token -->
          <template #cell(tokens)="data">
            <div
              v-if="data.item.tokens > 0"
              class="d-flex flex-column"
            >
              <span class="font-weight-bold mb-0">{{ tokenFormatter(data.item.tokens, stakingParameters.bond_denom) }}</span>
              <span class="font-small-2 text-muted text-nowrap d-none d-lg-block">{{ percent(data.item.tokens/stakingPool) }}%</span>
            </div>
            <span v-else>{{ data.item.delegator_shares }}</span>
          </template>
          <!-- Token -->
          <template #cell(changes)="data">
            <small
              v-if="data.item.changes>0"
              class="text-success"
            >+{{ data.item.changes }}</small>
            <small v-else-if="data.item.changes===0">-</small>
            <small
              v-else
              class="text-danger"
            >{{ data.item.changes }}</small>
          </template>
          <!-- Token -->
          <template #cell(ltchange)="data">
            <small
              v-if="data.item.ltchange>0"
              class="text-success"
            >+{{ data.item.ltchange }}</small>
            <small v-else-if="data.item.ltchange===0">-</small>
            <small
              v-else
              class="text-danger"
            >{{ data.item.ltchange }}</small>
          </template>
          <!-- Token -->
          <template #cell(delegate)="data">
            <div v-if="rankSoFar(data) == 'primary'">
              <div v-if="giveLittleMore(data) > 0">
                Target: {{ tokenFormatter(giveLittleMore(data), stakingParameters.bond_denom) }} More
                <br>
                <b-button
                  variant="primary"
                  class="mr-25 mb-25"
                  @click="show_delegate_modal(data.item.operator_address)"
                >
                  Delegate
                </b-button>
              </div>
              <div v-else>
                Target Reached :)
              </div>
            </div>
            <small
              v-else-if="rankSoFar(data) == 'danger'"
              class="text-danger">Top 33% Already
            </small>
            <small
              v-else-if="rankSoFar(data) == 'warning'"
              class="text-warning">Top 67% Already
            </small>
          </template>
        </b-table>
      </b-card-body>
    </b-card>
    <operation-delegate-component
      :validator-address="delegate_operator_address"
    />
  </div>
</template>

<script>
import {
  BTable, BMedia, BAvatar, BBadge, BCard, BCardHeader, BCardTitle, VBTooltip, BCardBody, VBModal, BButton,
} from 'bootstrap-vue'
import {
  Validator, percent, StakingParameters, formatToken,
} from '@/libs/data'
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
    BButton,
    BCardHeader,
    BCardTitle,
    BCardBody,
    OperationDelegateComponent,
  },
  directives: {
    'b-modal': VBModal,
    'b-tooltip': VBTooltip,
  },
  data() {
    return {
      islive: true,
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
          sortable: true,
        },
        {
          key: 'ltchange',
          label: '3D Changes',
          sortable: true,
        },
        {
          key: 'delegate',
        },
        {
          key: 'commission',
          formatter: value => `${percent(value.rate)}%`,
          tdClass: 'text-right d-none d-md-block',
          thClass: 'text-right d-none d-md-block',
          sortable: true,
          sortByFormatted: true,
        },
      ],
      delegate_operator_address: '',
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
      let height = Number(data.block_height)
      if (height > 14400) {
        height -= 14400
      } else {
        height = 1
      }
      const changes = []
      data.validators.forEach(x => {
        changes[x.pub_key.value] = { latest: Number(x.voting_power), previous: 0 }
      })
      this.$http.getValidatorListByHeight(height).then(previous => {
        previous.validators.forEach(x => {
          if (changes[x.pub_key.value]) {
            changes[x.pub_key.value].previous = Number(x.voting_power)
          } else {
            changes[x.pub_key.value] = { latest: 0, previous: Number(x.voting_power) }
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
        ltchange[x.pub_key.value] = { latest: Number(x.voting_power), previous: 0 }
      })
      this.$http.getValidatorListByHeight(lwheight).then(previous => {
        previous.validators.forEach(x => {
          if (ltchange[x.pub_key.value]) {
            ltchange[x.pub_key.value].previous = Number(x.voting_power)
          } else {
            ltchange[x.pub_key.value] = { latest: 0, previous: Number(x.voting_power) }
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
        promise = promise.then(() => new Promise(resolve => {
          this.avatar(item, resolve)
        }))
      })
    })
  },
  beforeDestroy() {
    this.islive = false
  },
  methods: {
    percent,
    tokenFormatter(amount, denom) {
      return formatToken({ amount, denom })
    },
    giveLittleMore(data) {
      // if node did not get at least 1% more today, encourage it
      const onepct = Math.floor(data.item.delegator_shares / 1e6 / 100)
      if (data.item.ltchange > onepct) { // If we already got a lot recently, don't ask for more
        return 0 // no more
      }

      // check how much we're missing
      let missing = onepct - data.item.ltchange

      // quick exit if 0 missing
      if (missing === 0) return 0

      // for sudden deallocations, we're not trying to fill in giant gaps
      // example if we lost -50000, we're not going to target +51000 to bring you back up
      if (data.item.changes < 0) {
        // in that case, we are only targeting a max of +1000 for today
        missing = Math.min(onepct, 1000) - data.item.changes
      }

      // if missing a lot, then be reasonable
      // soft limit at 1000 to encourage delegation lower
      if (missing > 1000) {
        missing = 1000
      }

      // just missing a nominal amount
      return missing * 1e6
    },
    rankSoFar() {
      // avoid gloval var change in rankBadge()
      const rank = (window.sum / this.stakingPool)
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
              const validator = this.validators.find(u => u.description.identity === identity)
              this.$set(validator, 'avatar', pic.primary.url)
              this.$store.commit('cacheAvatar', { identity, url: pic.primary.url })
            }
          }
        })
      }
    },
    show_delegate_modal(address) {
      this.$set(this, 'delegate_operator_address', address)
      this.$nextTick(() => {
        this.$bvModal.show('delegate-window')
      })
    },
  },
}
</script>
