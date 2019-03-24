
export enum pType {
  inlinePump = 10,
  suctionPump = 20,
  allroundPump = 30,
}


export class Pump {

  name;
  id;
  type;
  flowVolume;
  pressure;
  out;
  pos;

  constructor(pType, out) {
    this.name = "";
    this.id = "";
    this.type = pType;
    this.flowVolume = 0;
    this.pressure = 0;
    this.out = out;
    this.pos = [];
  }
  

  

 // public clone() {
 //   var p = new Pump();
 //   p.name = this.name;
 //   p.id = this.id;
 //   p.type = this.type;
 //   p.pressure = this.pressure;
 //   p.out = this.out;
 //   return p;
  //}



}
