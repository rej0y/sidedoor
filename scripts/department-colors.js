// Maps department names to CSS color variables for visual categorization
export function departmentToColor(department) {
    if (!department) {
        return 'var(--dept-other)';
    }

    const dept = department.toLowerCase();

    if (
        dept.includes('computer science') ||
        dept.includes('software engineering') ||
        dept.includes('cyber') ||
        dept.includes('information systems') ||
        dept.includes('network') ||
        dept.includes('database') ||
        dept.includes('web') ||
        dept.includes('cloud') ||
        dept.includes('data science') ||
        dept.includes('computer engineering') ||
        dept.includes('electrical engineering')
    ) {
        return 'var(--dept-cse)';
    }

    if (
        dept.includes('mathematics') ||
        dept.includes('physics') ||
        dept.includes('chemistry') ||
        dept.includes('biochemistry') ||
        dept.includes('biology') ||
        dept.includes('geology') ||
        dept.includes('environmental science') ||
        dept.includes('agriculture') ||
        dept.includes('manufacturing') ||
        dept.includes('mechanical') ||
        dept.includes('civil engineering') ||
        dept.includes('construction management') ||
        dept.includes('design and construction')
    ) {
        return 'var(--dept-stem)';
    }

    if (
        dept.includes('business') ||
        dept.includes('accounting') ||
        dept.includes('finance') ||
        dept.includes('economics') ||
        dept.includes('marketing') ||
        dept.includes('communication')
    ) {
        return 'var(--dept-business)';
    }

    if (
        dept.includes('education') ||
        dept.includes('special education') ||
        dept.includes('sped') ||
        dept.includes('home and family')
    ) {
        return 'var(--dept-education)';
    }

    if (
        dept.includes('english') ||
        dept.includes('language') ||
        dept.includes('international studies') ||
        dept.includes('humanities') ||
        dept.includes('philosophy') ||
        dept.includes('history') ||
        dept.includes('political science')
    ) {
        return 'var(--dept-humanities)';
    }

    if (
        dept.includes('psychology') ||
        dept.includes('sociology') ||
        dept.includes('social work') ||
        dept.includes('public health') ||
        dept.includes('nursing') ||
        dept.includes('human performance') ||
        dept.includes('recreation')
    ) {
        return 'var(--dept-health)';
    }

    if (
        dept.includes('art') ||
        dept.includes('dance') ||
        dept.includes('music') ||
        dept.includes('theatre') ||
        dept.includes('theater')
    ) {
        return 'var(--dept-arts)';
    }

    if (
        dept === 'faculty' ||
        dept.includes('staff') ||
        dept.includes('administration') ||
        dept.includes('office')
    ) {
        return 'var(--dept-faculty)';
    }

    return 'var(--dept-other)';
}
