export const CustomerService = {
  getData() {
    return [
      {
        id: 1000,
        name: "James Butt",
        country: {
          name: "Algeria",
          code: "dz",
        },
        company: "Benton, John B Jr",
        date: "2015-09-13",
        status: "unqualified",
        verified: true,
        activity: 17,
        representative: {
          id: 1,
          name: "Borrador",
        },
        balance: 70663,
      },
      {
        id: 1001,
        name: "Josephine Darakjy",
        country: {
          name: "Egypt",
          code: "eg",
        },
        company: "Chanay, Jeffrey A Esq",
        date: "2019-02-09",
        status: "proposal",
        verified: true,
        activity: 0,
        representative: {
          id: 2,
          name: "Pendiente",
        },
        balance: 82429,
      },
    ];
  },

  getCustomersSmall() {
    return Promise.resolve(this.getData().slice(0, 10));
  },

  getCustomersMedium() {
    return Promise.resolve(this.getData().slice(0, 50));
  },

  getCustomersLarge() {
    return Promise.resolve(this.getData().slice(0, 200));
  },

  getCustomersXLarge() {
    return Promise.resolve(this.getData());
  },

  async getCustomers(params) {
    const queryParams = params
      ? Object.keys(params)
          .map(
            (k) => encodeURIComponent(k) + "=" + encodeURIComponent(params[k])
          )
          .join("&")
      : "";

    return fetch(
      "https://www.primefaces.org/data/customers?" + queryParams
    ).then((res) => res.json());
  },
};
