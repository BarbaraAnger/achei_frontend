import { Place } from './../models/place';
import { DialogCadastrarComponent } from './../shared/dialog-cadastrar/dialog-cadastrar.component';
import { MapService } from './../services/map.service';
import { Component, OnInit } from '@angular/core';
import { ComboPlaces } from '../models/combo-places';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { DialogDetalhesComponent } from '../shared/dialog-detalhes/dialog-detalhes.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  tiposPlaces: ComboPlaces[] = [
    { value: 'banheiros', viewValue: 'Banheiros' },
    { value: 'pontos-coleta-azeite', viewValue: 'Pontos de Coleta de Azeite' },
    { value: 'sebo', viewValue: 'Sebos' },
  ];
  public tipoPlaceSelecionado: string;
  public places: Place[];

  constructor(
    private mapService: MapService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.buscarAllPlaces();
  }

  buscarAllPlaces() {
    this.mapService.getAllPlaces()
    .subscribe(dados => {
      this.places = dados;
    });
  }

  buscarPlacesPorTipo(tipoPlace: string) {
    this.mapService.getPlacesPorTipo(tipoPlace)
    .subscribe(dados => {
      this.places = dados;
    });
  }

  savePlace(dados, eventCoordenadas) {
    dados.localizacao = {
      latitude: eventCoordenadas.coords.lat,
      longitude: eventCoordenadas.coords.lng,
    };
    console.log('dados para salvar', dados);
    this.mapService.savePlace(dados)
      .subscribe(() => {
        this.refreshView();
        // Chamar o buscarPlacesPorTipo passando o this.tipoPlaceSelecionado
      });
  }

  refreshView(): any {
    if (this.tipoPlaceSelecionado) {
      this.buscarPlacesPorTipo(this.tipoPlaceSelecionado);
    } else {
      this.buscarAllPlaces();
    }
  }

  configDetails(detailsCongif: MatDialogConfig, dadosSelecionado) {
    detailsCongif.data = dadosSelecionado;
  }

  openDetails(event) {
    console.log(event);
    const detailsConfig = new MatDialogConfig();
    const dadosSelecionado = {
      details: this.places,
    };

    this.configDetails(detailsConfig, dadosSelecionado);

    const show = this.dialog.open(DialogDetalhesComponent, detailsConfig);
  }

  configDialog(dialogConfig: MatDialogConfig, dados) {
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    dialogConfig.height = '500px';
    dialogConfig.width = '500px';

    dialogConfig.data = dados;
  }

  onCreateNewPlace(event) {
    console.log(event);
    const dialogConfig = new MatDialogConfig();
    const dados = {
      tiposPlaces: this.tiposPlaces,
    };

    this.configDialog(dialogConfig, dados);

    const dialogRef = this.dialog.open(DialogCadastrarComponent, dialogConfig);

    dialogRef.afterClosed()
      .subscribe(
        data => {
          if (data) {
            this.savePlace(data, event);
          }
        }
    );
  }

  onChangeSelectMapOption(tipoPlace: string) {
    this.tipoPlaceSelecionado = tipoPlace;
    this.buscarPlacesPorTipo(tipoPlace);
  }
}
