"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[4893],{94893:function(e,t,i){i.r(t),i.d(t,{W3mWalletReceiveView:function(){return C}});var r=i(31133),o=i(84927),n=i(32801),a=i(6943),s=i(66909),c=i(63043),l=i(52005),u=i(43291),d=i(86777),w=i(53357),p=i(92413);i(74975),i(23805),i(18360),i(5680);var h=i(84249),m=i(57116),f=i(11131),g=(0,f.iv)`
  button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({spacing:e})=>e[4]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[3]};
    border: none;
    padding: ${({spacing:e})=>e[3]};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color;
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  button:hover:enabled,
  button:active:enabled {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  wui-text {
    flex: 1;
    color: ${({tokens:e})=>e.theme.textSecondary};
  }

  wui-flex {
    width: auto;
    display: flex;
    align-items: center;
    gap: ${({spacing:e})=>e["01"]};
  }

  wui-icon {
    color: ${({tokens:e})=>e.theme.iconDefault};
  }

  .network-icon {
    position: relative;
    width: 20px;
    height: 20px;
    border-radius: ${({borderRadius:e})=>e[4]};
    overflow: hidden;
    margin-left: -8px;
  }

  .network-icon:first-child {
    margin-left: 0px;
  }

  .network-icon:after {
    position: absolute;
    inset: 0;
    content: '';
    display: block;
    height: 100%;
    width: 100%;
    border-radius: ${({borderRadius:e})=>e[4]};
    box-shadow: inset 0 0 0 1px ${({tokens:e})=>e.core.glass010};
  }
`,b=function(e,t,i,r){var o,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(n<3?o(a):n>3?o(t,i,a):o(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let k=class extends r.oi{constructor(){super(...arguments),this.networkImages=[""],this.text=""}render(){return(0,r.dy)`
      <button>
        <wui-text variant="md-regular" color="inherit">${this.text}</wui-text>
        <wui-flex>
          ${this.networksTemplate()}
          <wui-icon name="chevronRight" size="sm" color="inherit"></wui-icon>
        </wui-flex>
      </button>
    `}networksTemplate(){let e=this.networkImages.slice(0,5);return(0,r.dy)` <wui-flex class="networks">
      ${e?.map(e=>r.dy` <wui-flex class="network-icon"> <wui-image src=${e}></wui-image> </wui-flex>`)}
    </wui-flex>`}};k.styles=[h.ET,h.ZM,g],b([(0,o.Cb)({type:Array})],k.prototype,"networkImages",void 0),b([(0,o.Cb)()],k.prototype,"text",void 0),k=b([(0,m.M)("wui-compatible-network")],k),i(96277),i(930),i(44732);var y=i(4786),v=(0,p.iv)`
  wui-compatible-network {
    margin-top: ${({spacing:e})=>e["4"]};
    width: 100%;
  }

  wui-qr-code {
    width: unset !important;
    height: unset !important;
  }

  wui-icon {
    align-items: normal;
  }
`,x=function(e,t,i,r){var o,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(n<3?o(a):n>3?o(t,i,a):o(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let C=class extends r.oi{constructor(){super(),this.unsubscribe=[],this.address=a.R.getAccountData()?.address,this.profileName=a.R.getAccountData()?.profileName,this.network=a.R.state.activeCaipNetwork,this.unsubscribe.push(a.R.subscribeChainProp("accountState",e=>{e?(this.address=e.address,this.profileName=e.profileName):s.SnackController.showError("Account not found")}),a.R.subscribeKey("activeCaipNetwork",e=>{e?.id&&(this.network=e)}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){if(!this.address)throw Error("w3m-wallet-receive-view: No account provided");let e=c.f.getNetworkImage(this.network);return(0,r.dy)` <wui-flex
      flexDirection="column"
      .padding=${["0","4","4","4"]}
      alignItems="center"
    >
      <wui-chip-button
        data-testid="receive-address-copy-button"
        @click=${this.onCopyClick.bind(this)}
        text=${p.Hg.getTruncateString({string:this.profileName||this.address||"",charsStart:this.profileName?18:4,charsEnd:this.profileName?0:4,truncate:this.profileName?"end":"middle"})}
        icon="copy"
        size="sm"
        imageSrc=${e||""}
        variant="gray"
      ></wui-chip-button>
      <wui-flex
        flexDirection="column"
        .padding=${["4","0","0","0"]}
        alignItems="center"
        gap="4"
      >
        <wui-qr-code
          size=${232}
          theme=${l.ThemeController.state.themeMode}
          uri=${this.address}
          ?arenaClear=${!0}
          color=${(0,n.o)(l.ThemeController.state.themeVariables["--apkt-qr-color"]??l.ThemeController.state.themeVariables["--w3m-qr-color"])}
          data-testid="wui-qr-code"
        ></wui-qr-code>
        <wui-text variant="lg-regular" color="primary" align="center">
          Copy your address or scan this QR code
        </wui-text>
        <wui-button @click=${this.onCopyClick.bind(this)} size="sm" variant="neutral-secondary">
          <wui-icon slot="iconLeft" size="sm" color="inherit" name="copy"></wui-icon>
          <wui-text variant="md-regular" color="inherit">Copy address</wui-text>
        </wui-button>
      </wui-flex>
      ${this.networkTemplate()}
    </wui-flex>`}networkTemplate(){let e=a.R.getAllRequestedCaipNetworks(),t=a.R.checkIfSmartAccountEnabled(),i=a.R.state.activeCaipNetwork,o=e.filter(e=>e?.chainNamespace===i?.chainNamespace);if((0,u.r9)(i?.chainNamespace)===y.y_.ACCOUNT_TYPES.SMART_ACCOUNT&&t)return i?(0,r.dy)`<wui-compatible-network
        @click=${this.onReceiveClick.bind(this)}
        text="Only receive assets on this network"
        .networkImages=${[c.f.getNetworkImage(i)??""]}
      ></wui-compatible-network>`:null;let n=(o?.filter(e=>e?.assets?.imageId)?.slice(0,5)).map(c.f.getNetworkImage).filter(Boolean);return(0,r.dy)`<wui-compatible-network
      @click=${this.onReceiveClick.bind(this)}
      text="Only receive assets on these networks"
      .networkImages=${n}
    ></wui-compatible-network>`}onReceiveClick(){d.RouterController.push("WalletCompatibleNetworks")}onCopyClick(){try{this.address&&(w.j.copyToClopboard(this.address),s.SnackController.showSuccess("Address copied"))}catch{s.SnackController.showError("Failed to copy")}}};C.styles=v,x([(0,o.SB)()],C.prototype,"address",void 0),x([(0,o.SB)()],C.prototype,"profileName",void 0),x([(0,o.SB)()],C.prototype,"network",void 0),C=x([(0,p.Mo)("w3m-wallet-receive-view")],C)}}]);