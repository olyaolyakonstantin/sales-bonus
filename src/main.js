/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
   // Расчет выручки от операции
   const discount = 1 - (purchase.discount / 100)
   return purchase.sale_price * purchase.quantity * discount;
}

/**
 * Функция для расчета бонусов
 * 15% — для продавца, который принёс наибольшую прибыль (1 место)
 * 10% — для продавцов на втором и третьем месте
 * 5% — для всех остальных продавцов, кроме самого последнего
 * 0% — для продавца на последнем месте
 * 
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number} сумма бонуса в у.е.
 */
function calculateBonusByProfit(index, total, seller) {
    const { profit } = seller;
    switch (index) {
        case 0: // Первое место - 15%
            return profit * 0.15;
        case 1: // Второе место - 10%
        case 2: // Третье место - 10%
            return profit * 0.10;
        case total - 1: // Последнее место - 0%
            return 0;
        default: // Все остальные - 5%
            return profit * 0.05;
    }
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
    const { calculateRevenue, calculateBonus } = options; 

    // Проверка входных данных
    if (!data
        || !Array.isArray(data.sellers)
        || !Array.isArray(data.products)
        || !Array.isArray(data.purchase_records)
        || data.sellers.length === 0
        || data.products.length === 0
        || data.purchase_records.length === 0) 
        { 
            throw new Error('Некорректные входные данные'); }

    // Проверка наличия опций
    if (typeof options !== "object"
        || !calculateRevenue
        || !calculateBonus
        || typeof calculateRevenue !== "function"
        || typeof calculateBonus !== "function")
        {
            throw new Error('Некорректные опции'); }

    // @TODO: Подготовка промежуточных данных для сбора статистики
    // Инициализация статистики для каждого продавца
    let sellerStats = data.sellers.map(seller => {
        return {
            id: seller.id,
            name: `${seller.first_name} ${seller.last_name}`,
            revenue: 0,
            profit: 0,
            sales_count: 0,
            products_sold: {}
        };
    });

     // @TODO: Индексация продавцов и товаров для быстрого доступа
    let sellerIndex = Object.fromEntries(data.sellers.map(seller => [seller.id, seller]));
    let productIndex = Object.fromEntries(data.products.map(product => [product.sku, product]));
  
  /*
    // @TODO: Расчет выручки и прибыли для каждого продавца
    data.purchase_records.forEach(record => { // Чек 
        console.log('record: ', record)
        const seller = sellerIndex[record.seller_id]; // Продавец
        console.log('seller: ', seller)
        // Увеличить количество продаж 
        seller.sales_count++;
        console.log('seller.sales_count: ', seller.sales_count)
        // Увеличить общую сумму выручки всех продаж
        seller.revenue += record.total_amount;
        console.log('seller.revenue: ', seller.revenue)
        // Расчёт прибыли для каждого товара
        record.items.forEach(item => {
            const product = productIndex[item.sku]; // Товар
            // Посчитать себестоимость (cost) товара как product.purchase_price, умноженную на количество товаров из чека
            var cost = product.purchase_price * item.quantity
            console.log('cost: ', cost)
            // Посчитать выручку (revenue) с учётом скидки через функцию calculateRevenue
            // Посчитать прибыль: выручка минус себестоимость
        // Увеличить общую накопленную прибыль (profit) у продавца  
        });
     });
  */
    // @TODO: Расчет выручки и прибыли для каждого продавца

        console.log('record: ', data.purchase_records[0])
        let seller = sellerIndex[data.purchase_records[0].seller_id]; // Продавец
        console.log('seller: ', seller)
        // Увеличить количество продаж 
        seller.sales_count++;
        console.log('seller.sales_count: ', seller.sales_count)
        // Увеличить общую сумму выручки всех продаж
        seller.revenue += data.purchase_records[0].total_amount;
        console.log('seller.revenue: ', seller.revenue)
        // Расчёт прибыли для каждого товара
        data.purchase_records[0].items.forEach(item => {
            const product = productIndex[item.sku]; // Товар
            // Посчитать себестоимость (cost) товара как product.purchase_price, умноженную на количество товаров из чека
            let cost = product.purchase_price * item.quantity
            console.log('cost: ', cost)
            // Посчитать выручку (revenue) с учётом скидки через функцию calculateRevenue
            // Посчитать прибыль: выручка минус себестоимость
        // Увеличить общую накопленную прибыль (profit) у продавца  
        });
    


/*
        data.purchase_records.forEach(record => {
        const sellerId = record.seller_id;
        const sellerStat = sellerStat[sellerId];
 
        // Увеличиваем счётчик продаж
        sellerStat.sales_count++;
        
        // Обрабатываем каждый товар в чеке
        record.items.forEach(item => {
            const product = productsBySku[item.sku];
            
            // 1. Расчёт выручки от этого товара
            const itemRevenue = calculateRevenue(item, product);
            sellerStat.revenue += itemRevenue;
            
            // 2. Расчёт прибыли от этого товара
            const itemCost = product.purchase_price * item.quantity;
            const itemProfit = itemRevenue - itemCost;
            sellerStat.profit += itemProfit;
            
            // 3. Учёт проданных товаров в products_sold
            // Проверяем, есть ли уже такой SKU
            if (!sellerStat.products_sold[item.sku]) {
                sellerStat.products_sold[item.sku] = 0;
            }
            // Увеличиваем количество
            sellerStat.products_sold[item.sku] += item.quantity;

        }); 
    });
    */


    // @TODO: Сортировка продавцов по прибыли

    // @TODO: Назначение премий на основе ранжирования

    // @TODO: Подготовка итоговой коллекции с нужными полями
}


