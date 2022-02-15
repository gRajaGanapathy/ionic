import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { SwingModule } from 'angular2-swing';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HomePageRoutingModule,
    HttpClientModule,
    IonicModule,
    SwingModule
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
