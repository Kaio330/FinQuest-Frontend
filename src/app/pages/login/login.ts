import { Component } from '@angular/core';
import { DefautLoginLayout } from '../../components/defaut-login-layout/defaut-login-layout';

@Component({
  selector: 'app-login',
  imports: [
    DefautLoginLayout
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {}
