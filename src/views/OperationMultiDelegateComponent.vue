<template>
  <div>
    <b-modal
      id="multi-delegate-window"
      centered
      size="md"
      title="Delegate Token"
      ok-title="Send"
      hide-header-close
      scrollable
      :ok-disabled="!selectedAddress"
      @hidden="resetModal"
      @ok="handleOk"
      @show="onShow"
    >
      <b-overlay :show="!selectedAddress" rounded="sm">
        <template #overlay>
          <div class="text-center">
            <p id="cancel-label">
              No available account found.
            </p>
            <b-button variant="outline-primary" to="/wallet/import">
              Connect Wallet
            </b-button>
          </div>
        </template>
        <validation-observer ref="simpleRules">
          <b-form>
            <b-row>
              <b-col>
                <b>Targets</b>
                <div v-for="d in delegationTable">
                  {{ d.validator }} + {{ d.addAmount }}
                </div>
              </b-col>
            </b-row>
            <b-row>
              <b-col>
                <b-form-group label="Fee" label-for="Fee">
                  <validation-provider
                    v-slot="{ errors }"
                    rules="required|integer"
                    name="fee"
                  >
                    <b-input-group>
                      <b-form-input v-model="fee" />
                      <b-input-group-append>
                        <b-form-select
                          v-model="feeDenom"
                          :options="feeDenoms"
                          value-field="denom"
                          text-field="denom"
                        />
                      </b-input-group-append>
                    </b-input-group>
                    <small class="text-danger">{{ errors[0] }}</small>
                  </validation-provider>
                </b-form-group>
              </b-col>
              <b-col cols="12">
                <b-form-group>
                  <b-form-checkbox
                    v-model="advance"
                    name="advance"
                    value="true"
                  >
                    <small>Advance</small>
                  </b-form-checkbox>
                </b-form-group>
              </b-col>
            </b-row>
            <b-row v-if="advance">
              <b-col cols="12">
                <b-form-group label="Gas" label-for="gas">
                  <validation-provider v-slot="{ errors }" name="gas">
                    <b-form-input id="gas" v-model="gas" type="number" />
                    <small class="text-danger">{{ errors[0] }}</small>
                  </validation-provider>
                </b-form-group>
              </b-col>
              <b-col cols="12">
                <b-form-group label="Memo" label-for="Memo">
                  <validation-provider v-slot="{ errors }" name="memo">
                    <b-form-input id="Memo" v-model="memo" max="2" />
                    <small class="text-danger">{{ errors[0] }}</small>
                  </validation-provider>
                </b-form-group>
              </b-col>
            </b-row>

            <b-row>
              <b-col>
                <b-form-group label="Wallet" label-for="wallet">
                  <validation-provider
                    v-slot="{ errors }"
                    rules="required"
                    name="wallet"
                  >
                    <b-form-radio-group
                      v-model="wallet"
                      stacked
                      class="demo-inline-spacing"
                    >
                      <b-form-radio
                        v-model="wallet"
                        name="wallet"
                        value="keplr"
                        class="d-none d-md-block"
                      >
                        Keplr
                      </b-form-radio>
                      <b-form-radio
                        v-model="wallet"
                        name="wallet"
                        value="ledgerUSB"
                      >
                        <small>Ledger(USB)</small>
                      </b-form-radio>
                      <b-form-radio
                        v-model="wallet"
                        name="wallet"
                        value="ledgerBle"
                        class="mr-0"
                      >
                        <small>Ledger(Bluetooth)</small>
                      </b-form-radio>
                    </b-form-radio-group>
                    <small class="text-danger">{{ errors[0] }}</small>
                  </validation-provider>
                </b-form-group>
              </b-col>
            </b-row>
          </b-form>
        </validation-observer>
        {{ error }}
      </b-overlay></b-modal
    >
  </div>
</template>

<script>
import { ValidationProvider, ValidationObserver } from 'vee-validate'
import {
  BModal,
  BRow,
  BCol,
  BInputGroup,
  BFormInput,
  BFormGroup,
  BFormSelect,
  BFormSelectOption,
  BForm,
  BFormRadioGroup,
  BFormRadio,
  BButton,
  BInputGroupAppend,
  BFormCheckbox,
  BOverlay,
} from 'bootstrap-vue'
import {
  required,
  email,
  url,
  between,
  alpha,
  integer,
  password,
  min,
  digits,
  alphaDash,
  length,
} from '@validations'
import {
  abbrAddress,
  formatToken,
  formatTokenDenom,
  getLocalAccounts,
  getUnitAmount,
  setLocalTxHistory,
  sign,
  timeIn,
} from '@/libs/data'
import vSelect from 'vue-select'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'

export default {
  name: 'MultiDelegateDialogue',
  components: {
    BModal,
    BRow,
    BCol,
    BForm,
    BInputGroup,
    BFormInput,
    BFormGroup,
    BFormSelect,
    BFormSelectOption,
    BFormRadioGroup,
    BFormRadio,
    BFormCheckbox,
    vSelect,
    BButton,
    BInputGroupAppend,
    BOverlay,

    ValidationProvider,
    ValidationObserver,
    // eslint-disable-next-line vue/no-unused-components
    ToastificationContent,
  },
  props: {
    address: {
      type: String,
      default: null,
    },
    delegationTable: {
      type: Array,
      default: [],
    },
  },
  data() {
    return {
      selectedAddress: this.address,
      availableAddress: [],
      validators: [],
      selectedValidator: null,
      token: '',
      amount: null,
      chainId: '',
      selectedChain: '',
      balance: [],
      delegations: [],
      IBCDenom: {},
      memo: '',
      fee: '800',
      feeDenom: '',
      wallet: 'keplr',
      error: null,
      sequence: 1,
      accountNumber: 0,
      advance: false,
      gas: '200000',

      required,
      password,
      email,
      min,
      integer,
      url,
      alpha,
      between,
      digits,
      length,
      alphaDash,
    }
  },
  computed: {
    feeDenoms() {
      if (!this.balance) return []
      return this.balance.filter(item => !item.denom.startsWith('ibc'))
    },
  },
  created() {
    // console.log('address: ', this.address)
  },
  watch: {
    askAmount: function(newVal, oldVal) {
      // watch it
      //console.log('Prop changed: ', newVal, ' | was: ', oldVal)
      this.amount = newVal
      //console.log('new Amount', this.amount, '/', newVal)
    },
  },
  methods: {
    computeFee: function() {
      // CV
      console.log(
        'this.delegationTable: ',
        this.delegationTable,
        this.delegationTable.length
      )
      if (this.delegationTable.length > 0) {
        this.fee = 800
        this.gas = 150000
        if (true || this.chainId == 'dig-1') {
          this.fee *= this.delegationTable.length
          this.gas *= this.delegationTable.length
        }
      }
    },
    printDenom() {
      return formatTokenDenom(this.IBCDenom[this.token] || this.token)
    },
    onChange() {
      if (this.selectedAddress) {
        this.$http.getBankBalances(this.selectedAddress).then(res => {
          if (res && res.length > 0) {
            this.balance = res.reverse()
            const token = this.balance.find(i => !i.denom.startsWith('ibc'))
            this.token = token.denom
            if (token) this.feeDenom = token.denom
            this.balance
              .filter(i => i.denom.startsWith('ibc'))
              .forEach(x => {
                if (!this.IBCDenom[x.denom]) {
                  this.$http.getIBCDenomTrace(x.denom).then(denom => {
                    this.IBCDenom[x.denom] = denom.denom_trace.base_denom
                  })
                }
              })
          }
        })
        this.$http.getLatestBlock().then(ret => {
          this.chainId = ret.block.header.chain_id
          const notSynced = timeIn(ret.block.header.time, 10, 'm')
          if (notSynced) {
            this.error = 'Client is not synced or blockchain is halted'
          } else {
            this.error = null
          }
        })
        this.$http.getAuthAccount(this.selectedAddress).then(ret => {
          if (ret.value.base_vesting_account) {
            this.accountNumber =
              ret.value.base_vesting_account.base_account.account_number
            this.sequence = ret.value.base_vesting_account.base_account.sequence
            if (!this.sequence) this.sequence = 0
          } else {
            this.accountNumber = ret.value.account_number
            this.sequence = ret.value.sequence ? ret.value.sequence : 0
          }
        })
      }
      // this.$http.getStakingDelegations(this.selectedAddress).then(res => {
      //   this.delegations = res.delegation_responses
      // })
    },
    computeAccount() {
      const accounts = getLocalAccounts()
      const values = accounts ? Object.values(accounts) : []
      let array = []
      for (let i = 0; i < values.length; i += 1) {
        const addrs = values[i].address.filter(
          x => x.chain === this.$route.params.chain
        )
        if (addrs && addrs.length > 0) {
          array = array.concat(
            addrs.map(x => ({
              value: x.addr,
              label: values[i].name.concat(' - ', abbrAddress(x.addr)),
            }))
          )
          if (!this.selectedAddress) {
            this.selectedAddress = addrs[0].addr
          }
        }
      }
      this.selectedValidator = this.validatorAddress
      return array
    },
    onShow() {
      this.computeFee()
      this.onChange()
    },
    loadBalance() {
      console.log('loadBalance Deprecated')
      return false
      this.account = this.computeAccount()
      // if (this.account && this.account.length > 0) this.selectedAddress
      this.$http.getValidatorList().then(v => {
        this.validators = v
      })
      this.onChange()

      // CV Adjust gas and fees but only for specific networks
      if (this.chainId == 'dig-1') {
        console.log('dig-1 dynamic gas: ', this.delegations.length)
        this.fee = 2000
        this.gas = 200000
      } else if (this.$store.state.chains.selected.chain_name == 'comdex') {
        // console.log("dig-1 dynamic gas: ", this.delegations.length)
        this.fee = 5000
        this.gas = 200000
      } else {
      }
    },
    handleOk(bvModalEvt) {
      // console.log('send')
      // Prevent modal from closing
      bvModalEvt.preventDefault()
      // Trigger submit handler
      // this.handleSubmit()
      this.$refs.simpleRules.validate().then(ok => {
        if (ok) {
          this.sendTx().then(ret => {
            // console.log(ret)
            this.error = ret
          })
        }
      })
    },
    resetModal() {
      this.feeDenom = ''
      this.error = null
    },
    format(v) {
      return formatToken(v, this.IBCDenom)
    },
    delSnip(from, to, amount, denom) {
      return {
        typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
        value: {
          delegatorAddress: from,
          validatorAddress: to,
          amount: {
            amount: getUnitAmount(amount, denom),
            denom: denom,
          },
        },
      }
    },
    async sendTx() {
      const txMsgs = this.delegationTable.map(d =>
        this.delSnip(this.selectedAddress, d.action, d.addAmount, this.token)
      )
      /*
      const txMsgs = [
        {
          typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
          value: {
            delegatorAddress: this.selectedAddress,
            validatorAddress: this.selectedValidator,
            amount: {
              amount: getUnitAmount(this.amount, this.token),
              denom: this.token,
            },
          },
        },
      ]
         */

      if (txMsgs.length === 0) {
        this.error = 'No delegation found'
        return ''
      }
      if (!this.accountNumber) {
        this.error = 'Account number should not be empty!'
        return ''
      }

      const txFee = {
        amount: [
          {
            amount: this.fee,
            denom: this.feeDenom,
          },
        ],
        gas: this.gas,
      }

      const signerData = {
        accountNumber: this.accountNumber,
        sequence: this.sequence,
        chainId: this.chainId,
      }

      sign(
        this.wallet,
        this.chainId,
        this.selectedAddress,
        txMsgs,
        txFee,
        this.memo,
        signerData
      )
        .then(bodyBytes => {
          this.$http
            .broadcastTx(bodyBytes)
            .then(res => {
              setLocalTxHistory({
                op: 'delegate',
                hash: res.tx_response.txhash,
                time: new Date(),
              })
              this.$bvModal.hide('delegate-window')
              this.$toast({
                component: ToastificationContent,
                props: {
                  title: 'Transaction sent!',
                  icon: 'EditIcon',
                  variant: 'success',
                },
              })
            })
            .catch(e => {
              this.error = e
            })
        })
        .catch(e => {
          this.error = e
        })
      // Send tokens
      // return client.sendTokens(this.address, this.recipient, sendCoins, this.memo)
      return ''
    },
  },
}
</script>
<style lang="scss">
@import '@core/scss/vue/libs/vue-select.scss';
</style>
