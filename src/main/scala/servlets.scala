package servlets

import javax.servlet.http._
// import java.util.Enumeration;

class HelloServlet extends HttpServlet {

  override def doGet(request: HttpServletRequest, response: HttpServletResponse) {
    response.setContentType("text/html")
    response.setCharacterEncoding("UTF-8")
    response.getWriter.write("""<h1>Hello, worldcon 75!</h1>""")
  }

}

class StripeServlet extends HttpServlet {

  val myOutput = "<h1>There will be stripe stuff here!</h1>";

  override def doGet(request: HttpServletRequest, response: HttpServletResponse) {

    response.setContentType("text/html");
    response.setCharacterEncoding("UTF-8");
    response.getWriter.write(myOutput);
    // response.getWriter.write("""<h1>There will be stripe stuff here!</h1>""")

    var params = request.getParameterNames(); 
    while(params.hasMoreElements()){
      val paramName = params.nextElement();
      val myOutput = "Attribute Name: <strong>"+paramName+"</strong>, Value: <strong>"+request.getParameter(paramName)+"</strong><br>"
      response.getWriter.write(myOutput);
    }

    response.getWriter.write("Request Method: <strong>" + request.getMethod() + "</strong>");

  }

}
