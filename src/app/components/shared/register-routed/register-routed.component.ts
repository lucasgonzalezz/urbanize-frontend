import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserAjaxService } from 'src/app/service/user.ajax.service';
import { CryptoService } from 'src/app/service/crypto.service';
import { IUser } from 'src/app/model/model.interfaces';

@Component({
  selector: 'app-register-routed',
  templateUrl: './register-routed.component.html',
  styleUrls: ['./register-routed.component.css']
})
export class RegisterRoutedComponent implements OnInit {

  userForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private cryptoService: CryptoService,
    private formBuilder: FormBuilder,
    private userService: UserAjaxService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.userForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      last_name1: ['', [Validators.minLength(3), Validators.maxLength(255)]],
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      birth_date: ['', [Validators.required]],
      // phone: ['', [Validators.required]],
      dni: ['', [Validators.required, Validators.pattern(/^[0-9]{8}[A-Za-z]$/)]],
      address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]]
    });
  }
  
  hasError(controlName: string, errorName: string): boolean {
    return this.userForm.controls[controlName].hasError(errorName);
  }

  isAdult(): boolean {
    if (this.userForm.get('birth_date')?.value) {
      const birth_date = new Date(this.userForm.get('birth_date')?.value);
      const today = new Date();
      const age = today.getFullYear() - birth_date.getFullYear();
      const monthDiff = today.getMonth() - birth_date.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth_date.getDate())) {
        return age - 1 >= 18;
      }
      return age >= 18;
    }
    return false;
  }

  onSubmit(): void {
    if (this.userForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const userData = { ...this.userForm.value } as IUser;
      const password = this.cryptoService.getSHA256(this.userForm.value.password);

      this.userService.createUserWithPassword(userData, password).subscribe(
        (userId: number) => {
          this.snackBar.open('Usuario registrado correctamente', 'Aceptar', { duration: 3000 });
          this.router.navigate(['/login']);
        },
        error => {
          this.snackBar.open('Error al registrar usuario', 'Aceptar', { duration: 3000 });
          this.isSubmitting = false;
        }
      );
    } else {
      Object.keys(this.userForm.controls).forEach(field => {
        const control = this.userForm.get(field);
        if (control) {
          if (control.invalid) {
            control.markAsTouched({ onlySelf: true });
          }
        }
      });
    }
  }

}
