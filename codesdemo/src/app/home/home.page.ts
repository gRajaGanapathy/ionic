import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { LoadingController, NavController, ToastController } from '@ionic/angular';
import { StackConfig, SwingCardComponent, SwingStackComponent, ThrowEvent } from 'angular2-swing';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  @ViewChild('myswing1') swingStack: SwingStackComponent;
  @ViewChildren('mycards1') swingCards: QueryList<SwingCardComponent>;

  cards: Array<any>;
  stackConfig: StackConfig;
  recentCard: string = '';
  currentCard: number = 0;
  members: any[];
  rate = 0;
  showRestart = false;

  constructor(
    public navCtrl: NavController, private http: HttpClient, public sanitizer: DomSanitizer,
    public toastController: ToastController, private isLoading: LoadingController) {
    this.stackConfig = {
      throwOutConfidence: (offsetX, offsetY, element) => {
        return Math.min(Math.abs(offsetX) / (element.offsetWidth / 2), 1);
      },
      transform: (element, x, y, r) => {
        this.onItemMove(element, x, y, r);
      },
      throwOutDistance: (d) => {
        return 800;
      }
    };
  }

  ngAfterViewInit() {
    // Either subscribe in controller or set in HTML
    this.swingStack.throwin.subscribe((event: any) => {
      event.target.style.background = '#ffffff';
    });

    this.cards = [];
    this.getUserList();
  }

  // Called whenever we drag an element
  onItemMove(element, x, y, r) {
    var color = '';
    var abs = Math.abs(x);
    let min = Math.trunc(Math.min(16 * 16 - abs, 16 * 16));
    let hexCode = this.decimalToHex(min, 2);

    if (x < 0) {
      color = '#FF' + hexCode + hexCode;
    } else {
      color = '#' + hexCode + 'FF' + hexCode;
    }

    element.style.background = color;
    element.style['transform'] = `translate3d(0, 0, 0) translate(${x}px, ${y}px) rotate(${r}deg)`;
  }

  // Add new cards to our array
  addNewCards(count: number) {
    console.log("Added Card ", count)

    this.cards.pop();
    console.log('this.currentCard', this.currentCard)
    if (this.currentCard <= this.members.length) {
      let data = this.members[this.currentCard + 1];
      this.cards.push(data);
      this.currentCard++;
    }
    else {

    }

  }
  async getUserList() {
    await this.isLoading.create({
      message: 'Loading data...',
      spinner: 'crescent'
    }).then((loading) => {
      loading.present();
      this.http.get<any>('assets/profile.json').subscribe((data: any) => {
        this.members = data.profile_details;
        setTimeout(() => {
          loading.dismiss();
        }, 500);
        this.addNewCards(1);

      }, error => {
        setTimeout(() => {
          loading.dismiss();
        }, 500);
        console.log("error while calling api :  " + error)
      });
    });
  }
  // Connected through HTML
  async voteUp(like: any): Promise<void> {
    await this.isLoading.create({
      message: 'Please wait...',
      spinner: 'crescent'
    }).then((loading) => {
      loading.present();
      setTimeout(() => {
        loading.dismiss();
      }, 500)
    });
    let removedCard = this.cards.pop();
    console.log('removedCard', removedCard)
    console.log('memeneer', this.members.length, this.currentCard)
    const length = this.members.length;
    console.log('length', length)
    if (this.currentCard === 13) {
      this.showRestart = true;
      const toast = await this.toastController.create({
        message: 'You have completed the maximum swipeing Limit',
        duration: 4000,
        position: 'middle',
        color: 'warning'
      });
      toast.present();
    } else {
      this.rate = 0;
      this.addNewCards(1);
      if (like === true) {
        this.recentCard = 'You liked: ' + JSON.stringify(removedCard.name);
        const toast = await this.toastController.create({
          message: "Interested",
          duration: 3000,
          position: 'top',
          color: 'success'
        });
        toast.present();
      } else if(like === 'Shortlisted'){
        this.recentCard = 'You Shortlisted: ' + JSON.stringify(removedCard.name);
        const toast = await this.toastController.create({
          message: "Shortlisted",
          duration: 3000,
          position: 'top',
          color: 'warning'
        });
        toast.present();
      } else {
        this.recentCard = 'You disliked: ' + JSON.stringify(removedCard.name);
        const toast = await this.toastController.create({
          message: "Not Interested!",
          duration: 3000,
          position: 'top',
          color: 'danger'
        });
        toast.present();
      }

    }
  }

  // http://stackoverflow.com/questions/57803/how-to-convert-decimal-to-hex-in-javascript
  decimalToHex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
      hex = "0" + hex;
    }

    return hex;
  }

  getUrl(): any {
    if (this.cards[0].snippet.thumbnails != undefined) {
      return this.cards[0].snippet.thumbnails.high.url;
      //return this.sanitizer.bypassSecurityTrustResourceUrl("https://www.youtube.com/embed/"+ this.cards[0].id.videoId +"?autoplay=0");
    }
  }

  handleratings(e): void {
    this.rate = e;
  }
  onClick() {
    this.currentCard = 0;
    this.getUserList();
    // Either subscribe in controller or set in HTML
    this.swingStack.throwin.subscribe((event: any) => {
      event.target.style.background = '#ffffff';
    });

    this.cards = [];
    this.showRestart = false;
  }

}
