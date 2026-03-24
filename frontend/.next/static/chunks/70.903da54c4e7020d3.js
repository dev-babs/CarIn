"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[70],{90070:function(e,t,n){n.r(t),n.d(t,{W3mPayLoadingView:function(){return j},W3mPayView:function(){return B},arbitrumUSDC:function(){return es},arbitrumUSDT:function(){return ed},baseETH:function(){return et},baseSepoliaETH:function(){return ea},baseUSDC:function(){return en},ethereumUSDC:function(){return er},ethereumUSDT:function(){return eu},getExchanges:function(){return X},getIsPaymentInProgress:function(){return Q},getPayError:function(){return Z},getPayResult:function(){return J},openPay:function(){return K},optimismUSDC:function(){return ei},optimismUSDT:function(){return el},pay:function(){return q},polygonUSDC:function(){return eo},polygonUSDT:function(){return ep},solanaSOL:function(){return ey},solanaUSDC:function(){return ec},solanaUSDT:function(){return em}});var a=n(31133),r=n(84927),i=n(32801),s=n(6943),o=n(89512),c=n(53357),u=n(66909),l=n(64369),d=n(92413);n(97585),n(96277),n(4594),n(65451),n(29158),n(1799),n(53774),n(81255),n(10005),n(39203),n(44732),n(40511);var p=n(69887),m=n(55543),y=n(44649),h=n(86988),w=n(31929),g=n(76115),E=n(86777);let f={INVALID_PAYMENT_CONFIG:"INVALID_PAYMENT_CONFIG",INVALID_RECIPIENT:"INVALID_RECIPIENT",INVALID_ASSET:"INVALID_ASSET",INVALID_AMOUNT:"INVALID_AMOUNT",UNKNOWN_ERROR:"UNKNOWN_ERROR",UNABLE_TO_INITIATE_PAYMENT:"UNABLE_TO_INITIATE_PAYMENT",INVALID_CHAIN_NAMESPACE:"INVALID_CHAIN_NAMESPACE",GENERIC_PAYMENT_ERROR:"GENERIC_PAYMENT_ERROR",UNABLE_TO_GET_EXCHANGES:"UNABLE_TO_GET_EXCHANGES",ASSET_NOT_SUPPORTED:"ASSET_NOT_SUPPORTED",UNABLE_TO_GET_PAY_URL:"UNABLE_TO_GET_PAY_URL",UNABLE_TO_GET_BUY_STATUS:"UNABLE_TO_GET_BUY_STATUS"},I={[f.INVALID_PAYMENT_CONFIG]:"Invalid payment configuration",[f.INVALID_RECIPIENT]:"Invalid recipient address",[f.INVALID_ASSET]:"Invalid asset specified",[f.INVALID_AMOUNT]:"Invalid payment amount",[f.UNKNOWN_ERROR]:"Unknown payment error occurred",[f.UNABLE_TO_INITIATE_PAYMENT]:"Unable to initiate payment",[f.INVALID_CHAIN_NAMESPACE]:"Invalid chain namespace",[f.GENERIC_PAYMENT_ERROR]:"Unable to process payment",[f.UNABLE_TO_GET_EXCHANGES]:"Unable to get exchanges",[f.ASSET_NOT_SUPPORTED]:"Asset not supported by the selected exchange",[f.UNABLE_TO_GET_PAY_URL]:"Unable to get payment URL",[f.UNABLE_TO_GET_BUY_STATUS]:"Unable to get buy status"};class A extends Error{get message(){return I[this.code]}constructor(e,t){super(I[e]),this.name="AppKitPayError",this.code=e,this.details=t,Error.captureStackTrace&&Error.captureStackTrace(this,A)}}var N=n(5688);class b extends Error{}async function P(e,t){let n=function(){let e=N.OptionsController.getSnapshot().projectId;return`https://rpc.walletconnect.org/v1/json-rpc?projectId=${e}`}(),{sdkType:a,sdkVersion:r,projectId:i}=N.OptionsController.getSnapshot(),s={jsonrpc:"2.0",id:1,method:e,params:{...t||{},st:a,sv:r,projectId:i}},o=await fetch(n,{method:"POST",body:JSON.stringify(s),headers:{"Content-Type":"application/json"}}),c=await o.json();if(c.error)throw new b(c.error.message);return c}async function C(e){return(await P("reown_getExchanges",e)).result}async function S(e){return(await P("reown_getExchangePayUrl",e)).result}async function _(e){return(await P("reown_getExchangeBuyStatus",e)).result}let x=["eip155","solana"],T={eip155:{native:{assetNamespace:"slip44",assetReference:"60"},defaultTokenNamespace:"erc20"},solana:{native:{assetNamespace:"slip44",assetReference:"501"},defaultTokenNamespace:"token"}};function v(e,t){let{chainNamespace:n,chainId:a}=h.u.parseCaipNetworkId(e),r=T[n];if(!r)throw Error(`Unsupported chain namespace for CAIP-19 formatting: ${n}`);let i=r.native.assetNamespace,s=r.native.assetReference;"native"!==t&&(i=r.defaultTokenNamespace,s=t);let o=`${n}:${a}`;return`${o}/${i}:${s}`}var k=n(41613);async function R(e){let{paymentAssetNetwork:t,activeCaipNetwork:n,approvedCaipNetworkIds:a,requestedCaipNetworks:r}=e,i=c.j.sortRequestedNetworks(a,r).find(e=>e.caipNetworkId===t);if(!i)throw new A(f.INVALID_PAYMENT_CONFIG);if(i.caipNetworkId===n.caipNetworkId)return;let o=s.R.getNetworkProp("supportsAllNetworks",i.chainNamespace);if(!(a?.includes(i.caipNetworkId)||o))throw new A(f.INVALID_PAYMENT_CONFIG);try{await s.R.switchActiveNetwork(i)}catch(e){throw new A(f.GENERIC_PAYMENT_ERROR,e)}}async function U(e,t,n){if(t!==y.b.CHAIN.EVM)throw new A(f.INVALID_CHAIN_NAMESPACE);if(!n.fromAddress)throw new A(f.INVALID_PAYMENT_CONFIG,"fromAddress is required for native EVM payments.");let a="string"==typeof n.amount?parseFloat(n.amount):n.amount;if(isNaN(a))throw new A(f.INVALID_PAYMENT_CONFIG);let r=e.metadata?.decimals??18,i=l.ConnectionController.parseUnits(a.toString(),r);if("bigint"!=typeof i)throw new A(f.GENERIC_PAYMENT_ERROR);return await l.ConnectionController.sendTransaction({chainNamespace:t,to:n.recipient,address:n.fromAddress,value:i,data:"0x"})??void 0}async function D(e,t){if(!t.fromAddress)throw new A(f.INVALID_PAYMENT_CONFIG,"fromAddress is required for ERC20 EVM payments.");let n=e.asset,a=t.recipient,r=Number(e.metadata.decimals),i=l.ConnectionController.parseUnits(t.amount.toString(),r);if(void 0===i)throw new A(f.GENERIC_PAYMENT_ERROR);return await l.ConnectionController.writeContract({fromAddress:t.fromAddress,tokenAddress:n,args:[a,i],method:"transfer",abi:k.g.getERC20Abi(n),chainNamespace:y.b.CHAIN.EVM})??void 0}async function O(e,t){if(e!==y.b.CHAIN.SOLANA)throw new A(f.INVALID_CHAIN_NAMESPACE);if(!t.fromAddress)throw new A(f.INVALID_PAYMENT_CONFIG,"fromAddress is required for Solana payments.");let n="string"==typeof t.amount?parseFloat(t.amount):t.amount;if(isNaN(n)||n<=0)throw new A(f.INVALID_PAYMENT_CONFIG,"Invalid payment amount.");try{if(!g.O.getProvider(e))throw new A(f.GENERIC_PAYMENT_ERROR,"No Solana provider available.");let a=await l.ConnectionController.sendTransaction({chainNamespace:y.b.CHAIN.SOLANA,to:t.recipient,value:n,tokenMint:t.tokenMint});if(!a)throw new A(f.GENERIC_PAYMENT_ERROR,"Transaction failed.");return a}catch(e){if(e instanceof A)throw e;throw new A(f.GENERIC_PAYMENT_ERROR,`Solana payment failed: ${e}`)}}let L="unknown",M=(0,p.sj)({paymentAsset:{network:"eip155:1",asset:"0x0",metadata:{name:"0x0",symbol:"0x0",decimals:0}},recipient:"0x0",amount:0,isConfigured:!1,error:null,isPaymentInProgress:!1,exchanges:[],isLoading:!1,openInNewTab:!0,redirectUrl:void 0,payWithExchange:void 0,currentPayment:void 0,analyticsSet:!1,paymentId:void 0}),$={state:M,subscribe:e=>(0,p.Ld)(M,()=>e(M)),subscribeKey:(e,t)=>(0,m.VW)(M,e,t),async handleOpenPay(e){this.resetState(),this.setPaymentConfig(e),this.subscribeEvents(),this.initializeAnalytics(),M.isConfigured=!0,w.X.sendEvent({type:"track",event:"PAY_MODAL_OPEN",properties:{exchanges:M.exchanges,configuration:{network:M.paymentAsset.network,asset:M.paymentAsset.asset,recipient:M.recipient,amount:M.amount}}}),await o.I.open({view:"Pay"})},resetState(){M.paymentAsset={network:"eip155:1",asset:"0x0",metadata:{name:"0x0",symbol:"0x0",decimals:0}},M.recipient="0x0",M.amount=0,M.isConfigured=!1,M.error=null,M.isPaymentInProgress=!1,M.isLoading=!1,M.currentPayment=void 0},setPaymentConfig(e){if(!e.paymentAsset)throw new A(f.INVALID_PAYMENT_CONFIG);try{M.paymentAsset=e.paymentAsset,M.recipient=e.recipient,M.amount=e.amount,M.openInNewTab=e.openInNewTab??!0,M.redirectUrl=e.redirectUrl,M.payWithExchange=e.payWithExchange,M.error=null}catch(e){throw new A(f.INVALID_PAYMENT_CONFIG,e.message)}},getPaymentAsset:()=>M.paymentAsset,getExchanges:()=>M.exchanges,async fetchExchanges(){try{M.isLoading=!0;let e=await C({page:0,asset:v(M.paymentAsset.network,M.paymentAsset.asset),amount:M.amount.toString()});M.exchanges=e.exchanges.slice(0,2)}catch(e){throw u.SnackController.showError(I.UNABLE_TO_GET_EXCHANGES),new A(f.UNABLE_TO_GET_EXCHANGES)}finally{M.isLoading=!1}},async getAvailableExchanges(e){try{let t=e?.asset&&e?.network?v(e.network,e.asset):void 0;return await C({page:e?.page??0,asset:t,amount:e?.amount?.toString()})}catch(e){throw new A(f.UNABLE_TO_GET_EXCHANGES)}},async getPayUrl(e,t,n=!1){try{let a=Number(t.amount),r=await S({exchangeId:e,asset:v(t.network,t.asset),amount:a.toString(),recipient:`${t.network}:${t.recipient}`});return w.X.sendEvent({type:"track",event:"PAY_EXCHANGE_SELECTED",properties:{source:"pay",exchange:{id:e},configuration:{network:t.network,asset:t.asset,recipient:t.recipient,amount:a},currentPayment:{type:"exchange",exchangeId:e},headless:n}}),n&&(this.initiatePayment(),w.X.sendEvent({type:"track",event:"PAY_INITIATED",properties:{source:"pay",paymentId:M.paymentId||L,configuration:{network:t.network,asset:t.asset,recipient:t.recipient,amount:a},currentPayment:{type:"exchange",exchangeId:e}}})),r}catch(e){if(e instanceof Error&&e.message.includes("is not supported"))throw new A(f.ASSET_NOT_SUPPORTED);throw Error(e.message)}},async openPayUrl(e,t,n=!1){try{let a=await this.getPayUrl(e.exchangeId,t,n);if(!a)throw new A(f.UNABLE_TO_GET_PAY_URL);let r=e.openInNewTab??!0;return c.j.openHref(a.url,r?"_blank":"_self"),a}catch(e){throw e instanceof A?M.error=e.message:M.error=I.GENERIC_PAYMENT_ERROR,new A(f.UNABLE_TO_GET_PAY_URL)}},subscribeEvents(){M.isConfigured||(l.ConnectionController.subscribeKey("connections",e=>{e.size>0&&this.handlePayment()}),s.R.subscribeChainProp("accountState",e=>{let t=l.ConnectionController.hasAnyConnection(y.b.CONNECTOR_ID.WALLET_CONNECT);e?.caipAddress&&(t?setTimeout(()=>{this.handlePayment()},100):this.handlePayment())}))},async handlePayment(){M.currentPayment={type:"wallet",status:"IN_PROGRESS"};let e=s.R.getActiveCaipAddress();if(!e)return;let{chainId:t,address:n}=h.u.parseCaipAddress(e),a=s.R.state.activeChain;if(!n||!t||!a||!g.O.getProvider(a))return;let r=s.R.state.activeCaipNetwork;if(r&&!M.isPaymentInProgress)try{this.initiatePayment();let e=s.R.getAllRequestedCaipNetworks(),t=s.R.getAllApprovedCaipNetworkIds();switch(await R({paymentAssetNetwork:M.paymentAsset.network,activeCaipNetwork:r,approvedCaipNetworkIds:t,requestedCaipNetworks:e}),await o.I.open({view:"PayLoading"}),a){case y.b.CHAIN.EVM:"native"===M.paymentAsset.asset&&(M.currentPayment.result=await U(M.paymentAsset,a,{recipient:M.recipient,amount:M.amount,fromAddress:n})),M.paymentAsset.asset.startsWith("0x")&&(M.currentPayment.result=await D(M.paymentAsset,{recipient:M.recipient,amount:M.amount,fromAddress:n})),M.currentPayment.status="SUCCESS";break;case y.b.CHAIN.SOLANA:M.currentPayment.result=await O(a,{recipient:M.recipient,amount:M.amount,fromAddress:n,tokenMint:"native"===M.paymentAsset.asset?void 0:M.paymentAsset.asset}),M.currentPayment.status="SUCCESS";break;default:throw new A(f.INVALID_CHAIN_NAMESPACE)}}catch(e){e instanceof A?M.error=e.message:M.error=I.GENERIC_PAYMENT_ERROR,M.currentPayment.status="FAILED",u.SnackController.showError(M.error)}finally{M.isPaymentInProgress=!1}},getExchangeById:e=>M.exchanges.find(t=>t.id===e),validatePayConfig(e){let{paymentAsset:t,recipient:n,amount:a}=e;if(!t)throw new A(f.INVALID_PAYMENT_CONFIG);if(!n)throw new A(f.INVALID_RECIPIENT);if(!t.asset)throw new A(f.INVALID_ASSET);if(null==a||a<=0)throw new A(f.INVALID_AMOUNT)},handlePayWithWallet(){let e=s.R.getActiveCaipAddress();if(!e){E.RouterController.push("Connect");return}let{chainId:t,address:n}=h.u.parseCaipAddress(e),a=s.R.state.activeChain;if(!n||!t||!a){E.RouterController.push("Connect");return}this.handlePayment()},async handlePayWithExchange(e){try{M.currentPayment={type:"exchange",exchangeId:e};let{network:t,asset:n}=M.paymentAsset,a={network:t,asset:n,amount:M.amount,recipient:M.recipient},r=await this.getPayUrl(e,a);if(!r)throw new A(f.UNABLE_TO_INITIATE_PAYMENT);return M.currentPayment.sessionId=r.sessionId,M.currentPayment.status="IN_PROGRESS",M.currentPayment.exchangeId=e,this.initiatePayment(),{url:r.url,openInNewTab:M.openInNewTab}}catch(e){return e instanceof A?M.error=e.message:M.error=I.GENERIC_PAYMENT_ERROR,M.isPaymentInProgress=!1,u.SnackController.showError(M.error),null}},async getBuyStatus(e,t){try{let n=await _({sessionId:t,exchangeId:e});return("SUCCESS"===n.status||"FAILED"===n.status)&&w.X.sendEvent({type:"track",event:"SUCCESS"===n.status?"PAY_SUCCESS":"PAY_ERROR",properties:{message:"FAILED"===n.status?c.j.parseError(M.error):void 0,source:"pay",paymentId:M.paymentId||L,configuration:{network:M.paymentAsset.network,asset:M.paymentAsset.asset,recipient:M.recipient,amount:M.amount},currentPayment:{type:"exchange",exchangeId:M.currentPayment?.exchangeId,sessionId:M.currentPayment?.sessionId,result:n.txHash}}}),n}catch(e){throw new A(f.UNABLE_TO_GET_BUY_STATUS)}},async updateBuyStatus(e,t){try{let n=await this.getBuyStatus(e,t);M.currentPayment&&(M.currentPayment.status=n.status,M.currentPayment.result=n.txHash),("SUCCESS"===n.status||"FAILED"===n.status)&&(M.isPaymentInProgress=!1)}catch(e){throw new A(f.UNABLE_TO_GET_BUY_STATUS)}},initiatePayment(){M.isPaymentInProgress=!0,M.paymentId=crypto.randomUUID()},initializeAnalytics(){M.analyticsSet||(M.analyticsSet=!0,this.subscribeKey("isPaymentInProgress",e=>{if(M.currentPayment?.status&&"UNKNOWN"!==M.currentPayment.status){let e={IN_PROGRESS:"PAY_INITIATED",SUCCESS:"PAY_SUCCESS",FAILED:"PAY_ERROR"}[M.currentPayment.status];w.X.sendEvent({type:"track",event:e,properties:{message:"FAILED"===M.currentPayment.status?c.j.parseError(M.error):void 0,source:"pay",paymentId:M.paymentId||L,configuration:{network:M.paymentAsset.network,asset:M.paymentAsset.asset,recipient:M.recipient,amount:M.amount},currentPayment:{type:M.currentPayment.type,exchangeId:M.currentPayment.exchangeId,sessionId:M.currentPayment.sessionId,result:M.currentPayment.result}}})}}))}};var G=(0,a.iv)`
  wui-separator {
    margin: var(--apkt-spacing-3) calc(var(--apkt-spacing-3) * -1) var(--apkt-spacing-2)
      calc(var(--apkt-spacing-3) * -1);
    width: calc(100% + var(--apkt-spacing-3) * 2);
  }

  .token-display {
    padding: var(--apkt-spacing-3) var(--apkt-spacing-3);
    border-radius: var(--apkt-borderRadius-5);
    background-color: var(--apkt-tokens-theme-backgroundPrimary);
    margin-top: var(--apkt-spacing-3);
    margin-bottom: var(--apkt-spacing-3);
  }

  .token-display wui-text {
    text-transform: none;
  }

  wui-loading-spinner {
    padding: var(--apkt-spacing-2);
  }
`,Y=function(e,t,n,a){var r,i=arguments.length,s=i<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,n):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,n,a);else for(var o=e.length-1;o>=0;o--)(r=e[o])&&(s=(i<3?r(s):i>3?r(t,n,s):r(t,n))||s);return i>3&&s&&Object.defineProperty(t,n,s),s};let B=class extends a.oi{constructor(){super(),this.unsubscribe=[],this.amount="",this.tokenSymbol="",this.networkName="",this.exchanges=$.state.exchanges,this.isLoading=$.state.isLoading,this.loadingExchangeId=null,this.connectedWalletInfo=s.R.getAccountData()?.connectedWalletInfo,this.initializePaymentDetails(),this.unsubscribe.push($.subscribeKey("exchanges",e=>this.exchanges=e)),this.unsubscribe.push($.subscribeKey("isLoading",e=>this.isLoading=e)),this.unsubscribe.push(s.R.subscribeChainProp("accountState",e=>{this.connectedWalletInfo=e?.connectedWalletInfo})),$.fetchExchanges()}get isWalletConnected(){let e=s.R.getAccountData();return e?.status==="connected"}render(){return(0,a.dy)`
      <wui-flex flexDirection="column">
        <wui-flex flexDirection="column" .padding=${["0","4","4","4"]} gap="3">
          ${this.renderPaymentHeader()}

          <wui-flex flexDirection="column" gap="3">
            ${this.renderPayWithWallet()} ${this.renderExchangeOptions()}
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}initializePaymentDetails(){let e=$.getPaymentAsset();this.networkName=e.network,this.tokenSymbol=e.metadata.symbol,this.amount=$.state.amount.toString()}renderPayWithWallet(){return!function(e){let{chainNamespace:t}=h.u.parseCaipNetworkId(e);return x.includes(t)}(this.networkName)?(0,a.dy)``:(0,a.dy)`<wui-flex flexDirection="column" gap="3">
        ${this.isWalletConnected?this.renderConnectedView():this.renderDisconnectedView()}
      </wui-flex>
      <wui-separator text="or"></wui-separator>`}renderPaymentHeader(){let e=this.networkName;if(this.networkName){let t=s.R.getAllRequestedCaipNetworks().find(e=>e.caipNetworkId===this.networkName);t&&(e=t.name)}return(0,a.dy)`
      <wui-flex flexDirection="column" alignItems="center">
        <wui-flex alignItems="center" gap="2">
          <wui-text variant="h1-regular" color="primary">${this.amount||"0.0000"}</wui-text>
          <wui-flex class="token-display" alignItems="center" gap="1">
            <wui-text variant="md-medium" color="primary">
              ${this.tokenSymbol||"Unknown Asset"}
            </wui-text>
            ${e?(0,a.dy)`
                  <wui-text variant="sm-medium" color="secondary">
                    on ${e}
                  </wui-text>
                `:""}
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}renderConnectedView(){let e=this.connectedWalletInfo?.name||"connected wallet";return(0,a.dy)`
      <wui-list-item
        @click=${this.onWalletPayment}
        ?chevron=${!0}
        ?fullSize=${!0}
        ?rounded=${!0}
        data-testid="wallet-payment-option"
        imageSrc=${(0,i.o)(this.connectedWalletInfo?.icon)}
      >
        <wui-text variant="lg-regular" color="primary">Pay with ${e}</wui-text>
      </wui-list-item>

      <wui-list-item
        icon="power"
        ?rounded=${!0}
        iconColor="error"
        @click=${this.onDisconnect}
        data-testid="disconnect-button"
        ?chevron=${!1}
      >
        <wui-text variant="lg-regular" color="secondary">Disconnect</wui-text>
      </wui-list-item>
    `}renderDisconnectedView(){return(0,a.dy)`<wui-list-item
      variant="icon"
      iconVariant="overlay"
      icon="wallet"
      ?rounded=${!0}
      @click=${this.onWalletPayment}
      ?chevron=${!0}
      data-testid="wallet-payment-option"
    >
      <wui-text variant="lg-regular" color="primary">Pay from wallet</wui-text>
    </wui-list-item>`}renderExchangeOptions(){return this.isLoading?(0,a.dy)`<wui-flex justifyContent="center" alignItems="center">
        <wui-spinner size="md"></wui-spinner>
      </wui-flex>`:0===this.exchanges.length?(0,a.dy)`<wui-flex justifyContent="center" alignItems="center">
        <wui-text variant="md-medium" color="primary">No exchanges available</wui-text>
      </wui-flex>`:this.exchanges.map(e=>(0,a.dy)`
        <wui-list-item
          @click=${()=>this.onExchangePayment(e.id)}
          data-testid="exchange-option-${e.id}"
          ?chevron=${!0}
          ?disabled=${null!==this.loadingExchangeId}
          ?loading=${this.loadingExchangeId===e.id}
          imageSrc=${(0,i.o)(e.imageUrl)}
        >
          <wui-flex alignItems="center" gap="3">
            <wui-text flexGrow="1" variant="md-medium" color="primary"
              >Pay with ${e.name} <wui-spinner size="sm" color="secondary"></wui-spinner
            ></wui-text>
          </wui-flex>
        </wui-list-item>
      `)}onWalletPayment(){$.handlePayWithWallet()}async onExchangePayment(e){try{this.loadingExchangeId=e;let t=await $.handlePayWithExchange(e);t&&(await o.I.open({view:"PayLoading"}),c.j.openHref(t.url,t.openInNewTab?"_blank":"_self"))}catch(e){console.error("Failed to pay with exchange",e),u.SnackController.showError("Failed to pay with exchange")}finally{this.loadingExchangeId=null}}async onDisconnect(e){e.stopPropagation();try{await l.ConnectionController.disconnect()}catch{console.error("Failed to disconnect"),u.SnackController.showError("Failed to disconnect")}}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}};B.styles=G,Y([(0,r.SB)()],B.prototype,"amount",void 0),Y([(0,r.SB)()],B.prototype,"tokenSymbol",void 0),Y([(0,r.SB)()],B.prototype,"networkName",void 0),Y([(0,r.SB)()],B.prototype,"exchanges",void 0),Y([(0,r.SB)()],B.prototype,"isLoading",void 0),Y([(0,r.SB)()],B.prototype,"loadingExchangeId",void 0),Y([(0,r.SB)()],B.prototype,"connectedWalletInfo",void 0),B=Y([(0,d.Mo)("w3m-pay-view")],B);var V=n(52005),W=n(35652),F=n(63043);n(87302);var z=(0,a.iv)`
  :host {
    display: block;
    height: 100%;
    width: 100%;
  }

  wui-flex:first-child:not(:only-child) {
    position: relative;
  }

  wui-loading-thumbnail {
    position: absolute;
  }
`,H=function(e,t,n,a){var r,i=arguments.length,s=i<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,n):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,n,a);else for(var o=e.length-1;o>=0;o--)(r=e[o])&&(s=(i<3?r(s):i>3?r(t,n,s):r(t,n))||s);return i>3&&s&&Object.defineProperty(t,n,s),s};let j=class extends a.oi{constructor(){super(),this.loadingMessage="",this.subMessage="",this.paymentState="in-progress",this.paymentState=$.state.isPaymentInProgress?"in-progress":"completed",this.updateMessages(),this.setupSubscription(),this.setupExchangeSubscription()}disconnectedCallback(){clearInterval(this.exchangeSubscription)}render(){return(0,a.dy)`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${["7","5","5","5"]}
        gap="9"
      >
        <wui-flex justifyContent="center" alignItems="center"> ${this.getStateIcon()} </wui-flex>
        <wui-flex flexDirection="column" alignItems="center" gap="2">
          <wui-text align="center" variant="lg-medium" color="primary">
            ${this.loadingMessage}
          </wui-text>
          <wui-text align="center" variant="lg-regular" color="secondary">
            ${this.subMessage}
          </wui-text>
        </wui-flex>
      </wui-flex>
    `}updateMessages(){switch(this.paymentState){case"completed":this.loadingMessage="Payment completed",this.subMessage="Your transaction has been successfully processed";break;case"error":this.loadingMessage="Payment failed",this.subMessage="There was an error processing your transaction";break;default:$.state.currentPayment?.type==="exchange"?(this.loadingMessage="Payment initiated",this.subMessage="Please complete the payment on the exchange"):(this.loadingMessage="Awaiting payment confirmation",this.subMessage="Please confirm the payment transaction in your wallet")}}getStateIcon(){switch(this.paymentState){case"completed":return this.successTemplate();case"error":return this.errorTemplate();default:return this.loaderTemplate()}}setupExchangeSubscription(){$.state.currentPayment?.type==="exchange"&&(this.exchangeSubscription=setInterval(async()=>{let e=$.state.currentPayment?.exchangeId,t=$.state.currentPayment?.sessionId;e&&t&&(await $.updateBuyStatus(e,t),$.state.currentPayment?.status==="SUCCESS"&&clearInterval(this.exchangeSubscription))},4e3))}setupSubscription(){$.subscribeKey("isPaymentInProgress",e=>{e||"in-progress"!==this.paymentState||($.state.error||!$.state.currentPayment?.result?this.paymentState="error":this.paymentState="completed",this.updateMessages(),setTimeout(()=>{"disconnected"!==l.ConnectionController.state.status&&o.I.close()},3e3))}),$.subscribeKey("error",e=>{e&&"in-progress"===this.paymentState&&(this.paymentState="error",this.updateMessages())})}loaderTemplate(){let e=V.ThemeController.state.themeVariables["--w3m-border-radius-master"],t=e?parseInt(e.replace("px",""),10):4,n=this.getPaymentIcon();return(0,a.dy)`
      <wui-flex justifyContent="center" alignItems="center" style="position: relative;">
        ${n?(0,a.dy)`<wui-wallet-image size="lg" imageSrc=${n}></wui-wallet-image>`:null}
        <wui-loading-thumbnail radius=${9*t}></wui-loading-thumbnail>
      </wui-flex>
    `}getPaymentIcon(){let e=$.state.currentPayment;if(e){if("exchange"===e.type){let t=e.exchangeId;if(t){let e=$.getExchangeById(t);return e?.imageUrl}}if("wallet"===e.type){let e=s.R.getAccountData()?.connectedWalletInfo?.icon;if(e)return e;let t=s.R.state.activeChain;if(!t)return;let n=W.ConnectorController.getConnectorId(t);if(!n)return;let a=W.ConnectorController.getConnectorById(n);if(!a)return;return F.f.getConnectorImage(a)}}}successTemplate(){return(0,a.dy)`<wui-icon size="xl" color="success" name="checkmark"></wui-icon>`}errorTemplate(){return(0,a.dy)`<wui-icon size="xl" color="error" name="close"></wui-icon>`}};async function K(e){return $.handleOpenPay(e)}async function q(e,t=3e5){if(t<=0)throw new A(f.INVALID_PAYMENT_CONFIG,"Timeout must be greater than 0");try{await K(e)}catch(e){if(e instanceof A)throw e;throw new A(f.UNABLE_TO_INITIATE_PAYMENT,e.message)}return new Promise((e,n)=>{var a;let r=!1,i=setTimeout(()=>{r||(r=!0,o(),n(new A(f.GENERIC_PAYMENT_ERROR,"Payment timeout")))},t);function s(){if(r)return;let t=$.state.currentPayment,n=$.state.error,a=$.state.isPaymentInProgress;if(t?.status==="SUCCESS"){r=!0,o(),clearTimeout(i),e({success:!0,result:t.result});return}if(t?.status==="FAILED"){r=!0,o(),clearTimeout(i),e({success:!1,error:n||"Payment failed"});return}!n||a||t||(r=!0,o(),clearTimeout(i),e({success:!1,error:n}))}let o=(a=[ee("currentPayment",s),ee("error",s),ee("isPaymentInProgress",s)],()=>{a.forEach(e=>{try{e()}catch{}})});s()})}function X(){return $.getExchanges()}function J(){return $.state.currentPayment?.result}function Z(){return $.state.error}function Q(){return $.state.isPaymentInProgress}function ee(e,t){return $.subscribeKey(e,t)}j.styles=z,H([(0,r.SB)()],j.prototype,"loadingMessage",void 0),H([(0,r.SB)()],j.prototype,"subMessage",void 0),H([(0,r.SB)()],j.prototype,"paymentState",void 0),j=H([(0,d.Mo)("w3m-pay-loading-view")],j);let et={network:"eip155:8453",asset:"native",metadata:{name:"Ethereum",symbol:"ETH",decimals:18}},en={network:"eip155:8453",asset:"0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},ea={network:"eip155:84532",asset:"native",metadata:{name:"Ethereum",symbol:"ETH",decimals:18}},er={network:"eip155:1",asset:"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},ei={network:"eip155:10",asset:"0x0b2c639c533813f4aa9d7837caf62653d097ff85",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},es={network:"eip155:42161",asset:"0xaf88d065e77c8cC2239327C5EDb3A432268e5831",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},eo={network:"eip155:137",asset:"0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},ec={network:"solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",asset:"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},eu={network:"eip155:1",asset:"0xdAC17F958D2ee523a2206206994597C13D831ec7",metadata:{name:"Tether USD",symbol:"USDT",decimals:6}},el={network:"eip155:10",asset:"0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",metadata:{name:"Tether USD",symbol:"USDT",decimals:6}},ed={network:"eip155:42161",asset:"0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",metadata:{name:"Tether USD",symbol:"USDT",decimals:6}},ep={network:"eip155:137",asset:"0xc2132d05d31c914a87c6611c10748aeb04b58e8f",metadata:{name:"Tether USD",symbol:"USDT",decimals:6}},em={network:"solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",asset:"Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",metadata:{name:"Tether USD",symbol:"USDT",decimals:6}},ey={network:"solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",asset:"native",metadata:{name:"Solana",symbol:"SOL",decimals:9}}},65451:function(e,t,n){var a=n(31133),r=n(84927),i=n(32801);n(74975);var s=n(84249),o=n(57116),c=n(11131),u=(0,c.iv)`
  :host {
    position: relative;
  }

  button {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    padding: ${({spacing:e})=>e[1]};
  }

  /* -- Colors --------------------------------------------------- */
  button[data-type='accent'] wui-icon {
    color: ${({tokens:e})=>e.core.iconAccentPrimary};
  }

  button[data-type='neutral'][data-variant='primary'] wui-icon {
    color: ${({tokens:e})=>e.theme.iconInverse};
  }

  button[data-type='neutral'][data-variant='secondary'] wui-icon {
    color: ${({tokens:e})=>e.theme.iconDefault};
  }

  button[data-type='success'] wui-icon {
    color: ${({tokens:e})=>e.core.iconSuccess};
  }

  button[data-type='error'] wui-icon {
    color: ${({tokens:e})=>e.core.iconError};
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='xs'] {
    width: 16px;
    height: 16px;

    border-radius: ${({borderRadius:e})=>e[1]};
  }

  button[data-size='sm'] {
    width: 20px;
    height: 20px;
    border-radius: ${({borderRadius:e})=>e[1]};
  }

  button[data-size='md'] {
    width: 24px;
    height: 24px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  button[data-size='lg'] {
    width: 28px;
    height: 28px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  button[data-size='xs'] wui-icon {
    width: 8px;
    height: 8px;
  }

  button[data-size='sm'] wui-icon {
    width: 12px;
    height: 12px;
  }

  button[data-size='md'] wui-icon {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] wui-icon {
    width: 20px;
    height: 20px;
  }

  /* -- Hover --------------------------------------------------- */
  @media (hover: hover) {
    button[data-type='accent']:hover:enabled {
      background-color: ${({tokens:e})=>e.core.foregroundAccent010};
    }

    button[data-variant='primary'][data-type='neutral']:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }

    button[data-variant='secondary'][data-type='neutral']:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }

    button[data-type='success']:hover:enabled {
      background-color: ${({tokens:e})=>e.core.backgroundSuccess};
    }

    button[data-type='error']:hover:enabled {
      background-color: ${({tokens:e})=>e.core.backgroundError};
    }
  }

  /* -- Focus --------------------------------------------------- */
  button:focus-visible {
    box-shadow: 0 0 0 4px ${({tokens:e})=>e.core.foregroundAccent020};
  }

  /* -- Properties --------------------------------------------------- */
  button[data-full-width='true'] {
    width: 100%;
  }

  :host([fullWidth]) {
    width: 100%;
  }

  button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`,l=function(e,t,n,a){var r,i=arguments.length,s=i<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,n):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,n,a);else for(var o=e.length-1;o>=0;o--)(r=e[o])&&(s=(i<3?r(s):i>3?r(t,n,s):r(t,n))||s);return i>3&&s&&Object.defineProperty(t,n,s),s};let d=class extends a.oi{constructor(){super(...arguments),this.icon="card",this.variant="primary",this.type="accent",this.size="md",this.iconSize=void 0,this.fullWidth=!1,this.disabled=!1}render(){return(0,a.dy)`<button
      data-variant=${this.variant}
      data-type=${this.type}
      data-size=${this.size}
      data-full-width=${this.fullWidth}
      ?disabled=${this.disabled}
    >
      <wui-icon color="inherit" name=${this.icon} size=${(0,i.o)(this.iconSize)}></wui-icon>
    </button>`}};d.styles=[s.ET,s.ZM,u],l([(0,r.Cb)()],d.prototype,"icon",void 0),l([(0,r.Cb)()],d.prototype,"variant",void 0),l([(0,r.Cb)()],d.prototype,"type",void 0),l([(0,r.Cb)()],d.prototype,"size",void 0),l([(0,r.Cb)()],d.prototype,"iconSize",void 0),l([(0,r.Cb)({type:Boolean})],d.prototype,"fullWidth",void 0),l([(0,r.Cb)({type:Boolean})],d.prototype,"disabled",void 0),l([(0,o.M)("wui-icon-button")],d)},1799:function(e,t,n){n(23805)}}]);