import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NavController, ToastController } from '@ionic/angular';
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

  constructor(public navCtrl: NavController, private http: HttpClient, public sanitizer: DomSanitizer, public toastController: ToastController) {
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
    if (this.currentCard <= this.members.length) {
      let data = this.members[this.currentCard + 1];
      this.cards.push(data);
      this.currentCard++;
    }
    else {

    }

  }
  getUserList(): void {
    this.http.get<any>('assets/profile.json').subscribe((data: any) => {
      this.members = data.profile_details;
      this.addNewCards(1);

    }, error => {
      console.log("error while calling api :  " + error)
    });
  }
  // Connected through HTML
  voteUp(like: boolean) {
    let removedCard = this.cards.pop();
    console.log('removedCard', removedCard);
    if (!removedCard) {
      this.getUserList();
    }
    this.rate = 0;
    this.addNewCards(1);
    if (like) {
      this.recentCard = 'You liked: ' + JSON.stringify(removedCard.name);
    } else {
      this.recentCard = 'You disliked: ' + JSON.stringify(removedCard.name);
    }
    if (this.recentCard === 'You liked:') {
      this.toastController.create({
        message: "Interested",
        duration: 3000
      });
    } else {
      const toast = this.toastController.create({
        message: "Not Interested!",
        duration: 3000
      });
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

}
