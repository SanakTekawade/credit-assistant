// Indian Rupee & Financial Data Formatters

export function formatINR(val) {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  const num = Number(val);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

export function formatNumber(val) {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 1
  }).format(Number(val));
}

export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function getScoreDetails(score) {
  const num = Number(score) || 700;
  if (num >= 800) {
    return {
      category: 'Excellent',
      color: '#10B981', // emerald-500
      bgLight: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      badgeClass: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      description: 'Exceptional credit profile. Best approval chances and lowest interest rates with Indian prime banks.'
    };
  } else if (num >= 740) {
    return {
      category: 'Very Good',
      color: '#3B82F6', // blue-500
      bgLight: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      badgeClass: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
      description: 'Above average score. Favorable loan terms and swift credit approvals across most financial institutions.'
    };
  } else if (num >= 670) {
    return {
      category: 'Good',
      color: '#EAB308', // yellow-500
      bgLight: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      badgeClass: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
      description: 'Decent credit standing. Eligible for competitive loans, but improving utilization can push you to prime tier.'
    };
  } else if (num >= 580) {
    return {
      category: 'Fair',
      color: '#F97316', // orange-500
      bgLight: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      badgeClass: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
      description: 'Moderate risk category. Approvals may come with higher interest rates or stricter collateral demands.'
    };
  } else {
    return {
      category: 'Poor',
      color: '#EF4444', // red-500
      bgLight: 'bg-red-500/10 text-red-400 border-red-500/20',
      badgeClass: 'text-red-400 border-red-500/30 bg-red-500/10',
      description: 'Credit rebuilding required. High risk of loan rejection. Prioritize clearing overdue amounts and missed payments.'
    };
  }
}

export function getDtiDetails(dti) {
  const num = Number(dti) || 0;
  if (num < 30) {
    return {
      category: 'Low (<30%)',
      color: '#10B981',
      badgeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      description: 'Healthy debt burden. Most Indian banks view this as low risk.'
    };
  } else if (num <= 43) {
    return {
      category: 'Moderate (30-43%)',
      color: '#EAB308',
      badgeClass: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
      description: 'Manageable debt level, though higher EMIs reduce your monthly savings margin.'
    };
  } else {
    return {
      category: 'High (>43%)',
      color: '#EF4444',
      badgeClass: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      description: 'Elevated debt obligations. Lenders may hesitate on new unsecured credit approvals.'
    };
  }
}

export function getUtilizationDetails(util) {
  const num = Number(util) || 0;
  if (num < 30) {
    return {
      category: 'Optimal (<30%)',
      color: '#10B981',
      badgeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      description: 'Recommended limit usage. Helps maintain steady credit score growth.'
    };
  } else if (num <= 50) {
    return {
      category: 'Moderate (30-50%)',
      color: '#EAB308',
      badgeClass: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
      description: 'Acceptable range. Consider prepaying before statement generation dates.'
    };
  } else {
    return {
      category: 'High (>50%)',
      color: '#EF4444',
      badgeClass: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      description: 'Over-reliance on revolving credit card balances damages credit scores.'
    };
  }
}
