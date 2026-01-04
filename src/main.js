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
    if (index === 0) {
        return profit * 0.15;
    } else if (index === 1 || index === 2) {
        return profit * 0.10;
    } else if (index === (total-1)) {
        return 0;
    } else { // Для всех остальных
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

    // Подготовка промежуточных данных для сбора статистики
    // Инициализация статистики для каждого продавца
    const sellerStats = data.sellers.map(seller => {
        return {
            id: seller.id,
            name: `${seller.first_name} ${seller.last_name}`,
            revenue: 0,
            profit: 0,
            sales_count: 0,
            products_sold: {}
        };
    });

     // Индексация продавцов и товаров для быстрого доступа
    const sellerIndex = Object.fromEntries(sellerStats.map(seller => [seller.id, seller]));
    const productIndex = Object.fromEntries(data.products.map(product => [product.sku, product]));
  
  
    // Расчет выручки и прибыли для каждого продавца
    data.purchase_records.forEach(record => { // Чек 
        const seller = sellerIndex[record.seller_id]; // Продавец
        // Увеличить количество продаж 
        seller.sales_count++;
        // Увеличить общую сумму выручки всех продаж
        seller.revenue = seller.revenue + record.total_amount - record.total_discount; 

        // Расчёт прибыли для каждого товара
        record.items.forEach(item => {
            const product = productIndex[item.sku]; // Товар
            // Посчитать себестоимость (cost) товара как product.purchase_price, умноженную на количество товаров из чека
            const cost = product.purchase_price * item.quantity
            // Посчитать выручку (revenue) с учётом скидки через функцию calculateRevenue
            const revenue = calculateRevenue(item)
            // Посчитать прибыль: выручка минус себестоимость
            const profit = revenue - cost;
        // Увеличить общую накопленную прибыль (profit) у продавца  
            seller.profit += profit;
            if (!seller.products_sold[item.sku]) {
                seller.products_sold[item.sku] = 0;
            }
            seller.products_sold[item.sku]++;
        });
     });
    

    // Назначение премий на основе ранжирования
    sellerStats.forEach((seller, index) => {
        // Сортировка продавцов по прибыли
        const sortedByProfit = [...sellerStats].sort((a, b) => b.profit - a.profit);
        // Место в рейтинге по прибыли
        const rankIndex = sortedByProfit.findIndex(s => s.id === seller.id);

        seller.bonus = calculateBonus(
            rankIndex,              
            sellerStats.length,     
            seller                  
        );
        seller.top_products = Object.entries(seller.products_sold || {})
                                    .sort((a, b) => b[1] - a[1])  // Формируем топ-10 товаров
                                    .slice(0, 10)
                                    .map(([sku, quantity]) => ({ sku, quantity }))
    });

    // Подготовка итоговой коллекции с нужными полями
    return sellerStats.map(seller => ({
            seller_id: seller.id,
            name: seller.name,
            revenue: +seller.revenue.toFixed(2),
            profit: +seller.profit.toFixed(2),
            sales_count: seller.sales_count,
            top_products: seller.top_products,
            bonus: +seller.bonus.toFixed(2)
        }));
}



