
export default () => {
    return <>
        {require.context("../pages", true, /\.tsx$/, 'lazy').keys().map(v => <p key={v}>{v}</p>)}
    </>
}
