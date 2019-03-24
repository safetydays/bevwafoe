
export enum hType {
  a = 0,
  b = 1,
  f = 2,
  dieameterA = 110,
  dieameterB = 75,
  dieameterF = 150,
}

export class Hose {

  name;
  id;
  length;
  type;
  flowMax;
  pos;



  constructor(ht) {
    this.name = "";
    this.id = "";
    this.length = 0;
    this.type = ht;
    this.flowMax = 0;
    this.pos = [];
    if(this.type == hType.a) {
        this.flowMax = 2000;
    }
    if (this.type == hType.b) {
        this.flowMax = 2500;
    }
    if (this.type == hType.f) {
        this.flowMax = 7500;
    }
  }

 // public clone() {
 //     var h = new Hose();
 //     h.name = this.name;
 //     h.id = this.id;
 //     h.type = this.type;
 //     h.length = this.length;
 //     h.flowMax = this.flowMax;

 //     return h;
  //}

  pLoss(flow) {
      if (this.type == hType.b) {
          return (0.000001920 * Math.pow(flow, 2) - 0.00041318 * flow + 0.1381025) * this.length / 100;
      }

      if (this.type == hType.a) {
          return (0.0000002229 * Math.pow(flow, 2) + 0.000011196 * flow + 0.1280201) * this.length / 100;
      }

      if (this.type == hType.f) {
          return (0.0002252983 * flow - 0.3118138) * this.length / 100;
      }
  }
  
}
